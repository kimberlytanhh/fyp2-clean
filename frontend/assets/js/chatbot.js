document.addEventListener("DOMContentLoaded", () => {
  const chatBody = document.getElementById("chat-body");

  if (chatBody) {
    const saved = localStorage.getItem("chat_history");
    if (saved) chatBody.innerHTML = saved;
  }
});

function getToken() {
  return localStorage.getItem("access_token");
}

// ================= STATE =================
let reportFlow = {
  active: false,
  step: null,
  data: {},
  editing: null   // 🔥 NEW
};

const savedFlow = localStorage.getItem("chat_flow");
if (savedFlow) reportFlow = JSON.parse(savedFlow);

// Use existing utarLocations if available (from page)
const chatbotUTARLocations = window.utarLocations || [];

async function reverseGeocode(lat, lng) {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.display_name || null;
}

async function searchAddress(query) {
  if (query.length < 3) return [];
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=my`);
  if (!res.ok) return [];
  return await res.json();
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  if (!window.isChatPage && !window.location.pathname.includes("/admin/")) {
  createChatbotUI();
}
});

// ================= UI =================
function appendMessage(text, sender) {
  const chatBody = document.getElementById("chat-body");

  const wrapper = document.createElement("div");
  wrapper.className = `message ${sender}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerText = text;

  const time = document.createElement("div");
  time.className = "timestamp";
  time.innerText = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  wrapper.appendChild(bubble);
  wrapper.appendChild(time);

  chatBody.appendChild(wrapper);
  chatBody.scrollTop = chatBody.scrollHeight;
  localStorage.setItem("chat_history", chatBody.innerHTML);
}

// ================= TYPING =================
function showTyping() {
  const chatBody = document.getElementById("chat-body");

  const typing = document.createElement("div");
  typing.className = "message bot typing";
  typing.id = "typing";
  typing.innerText = "Typing...";

  chatBody.appendChild(typing);
}

function removeTyping() {
  const t = document.getElementById("typing");
  if (t) t.remove();
}

// ================= SEND CHAT =================
async function sendChat() {
  const input = document.getElementById("chat-input");
  const message = input.value.trim();

  if (!message) return;

  appendMessage(message, "user");
  input.value = "";

  const msg = message.toLowerCase();

  // 🔥 FULL RESET FLOW FOR NEW INTENT
  if (
    msg.includes("delete") ||
    msg.includes("remove") ||
    msg.includes("edit") ||
    msg.includes("update") ||
    msg.includes("create") ||
    msg.includes("make") ||
    msg.includes("new")
  ) {
    reportFlow = {
      active: false,
      step: null,
      data: {},
      editing: null
    };

    localStorage.removeItem("chat_flow"); // 🔥 IMPORTANT
  }

  // 🚨 FORCE STOP if intent matched
  if (
    msg.includes("delete") ||
    msg.includes("remove") ||
    msg.includes("edit") ||
    msg.includes("update") ||
    msg.includes("create") ||
    msg.includes("make") ||
    msg.includes("new")
  ) {
    console.log("Intent detected:", msg);
  }

  if (
    msg.includes("delete") ||
    msg.includes("remove")
  ) {
    appendMessage("Fetching your reports...", "bot");

    const res = await fetch("https://fyp2-backend-qp13.onrender.com/reports/me", {
      headers: { "Authorization": `Bearer ${getToken()}` }
    });

    const response = await res.json();
    const data = response.reports || response;

    if (!data.length) {
      appendMessage("You have no reports to delete.", "bot");
      return;
    }

    appendMessage("Select a report to delete:", "bot");

    showSuggestions(
      data.map(r => ({
        text: r.title,
        action: `delete_${r.id}`
      }))
    );

    return;
  }

  

  // ================= EDIT REPORT =================
  if (msg.includes("edit") || msg.includes("update")) {
    appendMessage("Fetching your reports...", "bot");

    try {
      const res = await fetch("https://fyp2-backend-qp13.onrender.com/reports/me", {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });

      console.log("STATUS:", res.status);

      const response = await res.json();
      console.log("RAW RESPONSE:", response);

      const data = response.reports || response;
      console.log("PARSED DATA:", data);

      if (!data || data.length === 0) {
        appendMessage("You have no reports to edit.", "bot");
        return;
      }

      appendMessage("Select a report to edit:", "bot");

      showSuggestions(
        data.map(r => ({
          text: r.title,
          action: `edit_existing_${r.id}`
        }))
      );

    } catch (err) {
      console.error("EDIT ERROR:", err);
      appendMessage("Failed to load reports ❌", "bot");
    }

    return;
  }

  // ================= REPORT FLOW =================
  if (reportFlow.active === true) {
    if (reportFlow.step === "title_ai_wait") {
      reportFlow.data.description = message;

      // 🔥 Call backend AI title generator
      try {
        const res = await fetch("https://fyp2-backend-qp13.onrender.com/chat/generate-title", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
          },
          body: JSON.stringify({ description: message })
        });

        const data = await res.json();
        reportFlow.data.title = data.title || "Generated Report Title";

      } catch {
        reportFlow.data.title = "Issue: " + message;
      }

      appendMessage(`Generated title: ${reportFlow.data.title}`, "bot");

      reportFlow.step = "description";
      appendMessage("Now describe the issue in detail.", "bot");

      return;
    }

    if (reportFlow.step === "title") {
      reportFlow.data.title = message;

      if (reportFlow.editing === "title") {
        reportFlow.editing = null;
        showConfirm();   // 🔥 go back to confirm
      } else {
        reportFlow.step = "description";
        appendMessage("Got it 👍 Now describe the issue.", "bot");
      }

      return;
    }

    if (reportFlow.step === "description") {
      reportFlow.data.description = message;

      if (reportFlow.editing === "description") {
        reportFlow.editing = null;
        showConfirm();   // 🔥 go back to confirm
      } else {
        appendMessage("Do you want to upload an image?", "bot");
        showSuggestions([
          { text: "Yes", action: "upload_image" },
          { text: "Skip", action: "skip_image" }
        ]);

        reportFlow.step = "image";
      }

      return;
    }

    if (reportFlow.step === "manual_location") {
      const results = await searchAddress(message);

      if (!results.length) {
        appendMessage("No results found. Try again.", "bot");
        return;
      }

      showAddressDropdown(results.slice(0, 5));
      return;
    }
  }

  // ================= START REPORT =================
if (
  msg.includes("create") ||
  msg.includes("make") ||
  msg.includes("new")
) {
  reportFlow.active = true;
  reportFlow.step = "title_choice";
  reportFlow.data = {};

  appendMessage("Would you like to create your own title or let AI generate one?", "bot");

  showSuggestions([
    { text: "✍️ I’ll write my own", action: "title_manual" },
    { text: "🤖 Generate with AI", action: "title_ai" }
  ]);
  return;
}

// ONLY use AI if no report flow
if (!reportFlow.active) {
  try {
    showTyping();

    const res = await fetch("https://fyp2-backend-qp13.onrender.com/chat/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    removeTyping();
    if (data.reply) appendMessage(data.reply, "bot");

  } catch {
    removeTyping();
    appendMessage("Error connecting to server.", "bot");
  }
}
}

// ================= LOCATION =================
function showLocationOptions() {
  reportFlow.step = "location_choice";

  appendMessage("How would you like to set the location?", "bot");

  showSuggestions([
    { text: "📍 Current Location", action: "loc_current" },
    { text: "🗺 Pick from Map", action: "loc_map" },
    { text: "🏫 UTAR Blocks", action: "loc_utar" },
    { text: "✍️ Type Address", action: "loc_manual" }
  ]);
}

// ================= CONFIRM =================
function showConfirm() {
  reportFlow.step = "confirm";

  appendMessage(
`Here is your report:

Title: ${reportFlow.data.title}
Description: ${reportFlow.data.description}
Location: ${reportFlow.data.location}

Confirm submission?`,
    "bot"
  );

  showSuggestions([
    { text: "Submit", action: "submit_report" },
    { text: "Edit", action: "edit_report" },
    { text: "Cancel", action: "cancel_report" }
  ]);
}

// ================= ADDRESS DROPDOWN =================
function showAddressDropdown(results) {
  const chatBody = document.getElementById("chat-body");

  const dropdown = document.createElement("div");
  dropdown.style.background = "#1e213a";
  dropdown.style.border = "1px solid #3a3f5c";
  dropdown.style.borderRadius = "8px";
  dropdown.style.marginTop = "6px";
  dropdown.style.maxHeight = "150px";
  dropdown.style.overflowY = "auto";

  results.slice(0, 5).forEach(place => {
    const item = document.createElement("div");

    item.textContent = place.display_name;
    item.style.padding = "8px";
    item.style.cursor = "pointer";
    item.style.fontSize = "12px";

    item.onmouseover = () => item.style.background = "#2a2f4a";
    item.onmouseout = () => item.style.background = "transparent";

    item.onclick = () => {
      reportFlow.data.location = place.display_name;
      reportFlow.data.latitude = parseFloat(place.lat);
      reportFlow.data.longitude = parseFloat(place.lon);

      appendMessage(place.display_name, "bot");

        if (reportFlow.editing === "location") {
          reportFlow.editing = null;
        }

        showConfirm();
    };

    dropdown.appendChild(item);
  });

  chatBody.appendChild(dropdown);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function showMapPicker() {
  const chatBody = document.getElementById("chat-body");

  const mapContainer = document.createElement("div");
  mapContainer.style.height = "220px";
  mapContainer.style.marginTop = "10px";
  mapContainer.style.borderRadius = "10px";
  mapContainer.style.overflow = "hidden";

  chatBody.appendChild(mapContainer);

  // 🔥 IMPORTANT: delay render so DOM is ready
  setTimeout(() => {
    const map = L.map(mapContainer).setView([4.336, 101.14], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // 🔥 FORCE FIX
    map.invalidateSize();

    let marker;

    map.on("click", async function (e) {
      if (marker) map.removeLayer(marker);

      marker = L.marker(e.latlng).addTo(map);

      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      const address = await reverseGeocode(lat, lng);

      reportFlow.data.location = address || "Selected location";
      reportFlow.data.latitude = lat;
      reportFlow.data.longitude = lng;

      appendMessage("Location selected from map 📍", "bot");

      if (reportFlow.editing === "location") {
        reportFlow.editing = null;
      }

      showConfirm();
    });

  }, 100); // small delay fixes rendering

  chatBody.scrollTop = chatBody.scrollHeight;
}

// ================= SUGGESTIONS =================
function showSuggestions(options) {
  const chatBody = document.getElementById("chat-body");
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "6px";
  container.style.margin = "8px 0";
  options.forEach(opt => {
    const link = document.createElement("div");
    link.textContent = opt.text;
    link.style.cursor = "pointer";
    link.style.color = "#8faaff";
    link.style.fontSize = "13px";
    link.style.paddingLeft = "10px";
    link.style.position = "relative";
    link.innerHTML = `• ${opt.text}`;
    link.onmouseover = () => {
    link.style.textDecoration = "underline";
    link.style.color = "#ffffff";
    
  };

  link.onmouseout = () => {
    link.style.textDecoration = "none";
    link.style.color = "#8faaff";
  };

    link.onclick = async () => {
      // ===== TITLE CHOICE =====
      if (opt.action === "title_manual") {
        reportFlow.step = "title";
        appendMessage("Enter your report title:", "bot");
      }

      if (opt.action === "title_ai") {
        reportFlow.step = "title_ai_wait";
        appendMessage("Describe the issue briefly so I can generate a title:", "bot");
      }


      if (opt.action === "upload_image") {
        const input = document.createElement("input");
        input.type = "file";

        input.onchange = () => {
          reportFlow.data.image = input.files[0];
          appendMessage(`Image uploaded: ${input.files[0].name} ✅`, "bot");
          showLocationOptions();
        };

        input.click();
      }

      if (opt.action === "skip_image") {
        showLocationOptions();
      }

      if (opt.action === "loc_current") {
        navigator.geolocation.getCurrentPosition(async pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          reportFlow.data.latitude = lat;
          reportFlow.data.longitude = lng;

          const address = await reverseGeocode(lat, lng);
          reportFlow.data.location = address || "Current location";

         appendMessage(`📍 ${reportFlow.data.location}`, "bot");

          if (reportFlow.editing === "location") {
            reportFlow.editing = null;
          }

          showConfirm();
        });
      }

      if (opt.action === "loc_map") {
        showMapPicker();
      }

      if (opt.action === "loc_utar") {
        showSuggestions(chatbotUTARLocations.map(loc => ({
          text: loc.name,
          action: `utar_${loc.name}`
        })));
      }

      if (opt.action.startsWith("utar_")) {
        const loc = utarLocations.find(l => l.name === opt.text);

        reportFlow.data.location = loc.name;
        reportFlow.data.latitude = loc.lat;
        reportFlow.data.longitude = loc.lng;

        appendMessage(`Selected ${loc.name}`, "bot");

        if (reportFlow.editing === "location") {
          reportFlow.editing = null;
        }

        showConfirm();
      }

      if (opt.action === "loc_manual") {
        reportFlow.step = "manual_location";
        appendMessage("Type the address:", "bot");
      }

      if (opt.action === "submit_report") {
        const formData = new FormData();
        formData.append("title", reportFlow.data.title);
        formData.append("description", reportFlow.data.description);
        formData.append("location", reportFlow.data.location);
        formData.append("latitude", reportFlow.data.latitude || 0);
        formData.append("longitude", reportFlow.data.longitude || 0);

        if (reportFlow.data.image) {
          formData.append("image", reportFlow.data.image);
        }

        await fetch("https://fyp2-backend-qp13.onrender.com/reports/", {
          method: "POST",
          headers: { "Authorization": `Bearer ${getToken()}` },
          body: formData
        });

        appendMessage("Report submitted successfully ✅", "bot");
        reportFlow.active = false;
      }

      if (opt.action === "edit_report") {
        appendMessage("What would you like to edit?", "bot");

        showSuggestions([
          { text: "Title", action: "edit_title" },
          { text: "Description", action: "edit_description" },
          { text: "Location", action: "edit_location" }
        ]);
      }

      if (opt.action === "edit_title") {
        reportFlow.step = "title";
        reportFlow.editing = "title";
        appendMessage("Enter new title:", "bot");
      }

      if (opt.action === "edit_description") {
        reportFlow.step = "description";
        reportFlow.editing = "description";
        appendMessage("Enter new description:", "bot");
      }

      if (opt.action === "edit_location") {
        reportFlow.editing = "location";
        showLocationOptions();
      }

      if (opt.action === "cancel_report") {
        reportFlow.active = false;
        appendMessage("Cancelled 👍", "bot");
      }

      if (opt.action.startsWith("delete_")) {
        const id = opt.action.split("_")[1];

        await fetch(`https://fyp2-backend-qp13.onrender.com/reports/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${getToken()}` }
        });

        appendMessage("Report deleted ✅", "bot");
      }

      if (opt.action.startsWith("edit_existing_")) {
        const id = opt.action.split("_")[2];

        const res = await fetch(`https://fyp2-backend-qp13.onrender.com/reports/${id}`, {
          headers: { "Authorization": `Bearer ${getToken()}` }
        });

        const data = await res.json();

        reportFlow.active = true;
        reportFlow.data = data;

        appendMessage("Loaded report. You can now edit it.", "bot");

        showConfirm();
      }
    };

    container.appendChild(link);
  });

  chatBody.appendChild(container);
}

// ================= FLOATING =================
function createChatbotUI() {
  const div = document.createElement("div");

  div.innerHTML = `
    <div id="chatbot-container">

      <div id="chatbot-toggle">
        💬

        <div id="chatbotHintBox" class="chatbot-hint-box">
          <span id="closeHint">✕</span>

          👋 Hey! Need help reporting something?<br>
          I can guide you step-by-step or even create a report for you.
        </div>
      </div>

      <div id="chatbot-box">
      <div id="chat-header">
        <span>CIRS Chatbot</span>
        <div>
          <span id="chat-expand">⛶</span>
          <span id="chat-close">✕</span>
        </div>
      </div>
      <div id="chat-body"></div>
      <div id="chat-input-area">
        <input id="chat-input" />
        <button onclick="sendChat()">➤</button>
      </div>
    </div>
  </div>
  `;

  document.body.appendChild(div);

  // ✅ get elements ONCE (global inside function)
  const hint = document.getElementById("chatbotHintBox");
  const closeBtn = document.getElementById("closeHint");

  // ✅ attach close button
  if (closeBtn && hint) {
    closeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      hint.classList.remove("show");
    });
  }


  // ONLY show on create report page
  const isCreatePage = window.location.pathname.includes("createreport.html");

  if (isCreatePage && hint) {

  // show popup
    setTimeout(() => {
      hint.classList.add("show");
    }, 1500);

    // auto hide after 20 seconds
    setTimeout(() => {
      hint.classList.remove("show");
    }, 16500); // 1.5s delay + 20s visible
  }


  // ✅ NOW elements exist → safe to attach events

  document.getElementById("chatbot-toggle").onclick = (e) => {

    // prevent toggle if clicking popup or X
    if (e.target.closest("#chatbotHintBox")) return;

    document.getElementById("chatbot-box").classList.toggle("show");
  };

  document.getElementById("chat-close").onclick = () => {
    document.getElementById("chatbot-box").classList.remove("show");
  };

  document.getElementById("chat-expand").onclick = () => {
    localStorage.setItem("chat_history", document.getElementById("chat-body").innerHTML);
    localStorage.setItem("chat_flow", JSON.stringify(reportFlow));
      const role = localStorage.getItem("role");

      if (role === "admin") {
        window.location.href = "/admin/chatbot.html";
      } else {
        window.location.href = "/chatbot.html";
      }
      };

  const role = localStorage.getItem("role");

  const chatBody = document.getElementById("chat-body");

  if (role === "admin") {
    const existing = localStorage.getItem("chat_history");

    if (!existing || !existing.includes("Admin Mode Activated")) {
      appendMessage("🛠 Admin Mode Activated", "bot");
    }
  }
}