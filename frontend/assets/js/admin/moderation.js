const API_BASE = "https://fyp2-backend-qp13.onrender.com";
let allReports = [];
let showAllFlagged = false;
let showAllRecent = false;
/* =========================
   LOAD MODERATION REPORTS
========================= */

async function loadModeration() {

  const token = getToken();

  const res = await fetch(`${API_BASE}/reports/admin/all`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Failed to load reports");
    return;
  }

  const reports = await res.json();
  allReports = reports;
  const flagged = document.getElementById("flaggedReports");
  const recent = document.getElementById("recentReports");
  const approved = document.getElementById("approvedReports");
  const rejected = document.getElementById("rejectedReports");

  approved.innerHTML = "";
  rejected.innerHTML = "";  
  flagged.innerHTML = "";
  recent.innerHTML = "";

  const flaggedReports = reports.filter(r => r.status === "flagged");
  const recentReports = reports.filter(r => r.status !== "flagged");

  flaggedReports.forEach(r =>
    flagged.appendChild(createCard(r, true))
  );

  recentReports.forEach(r =>
    recent.appendChild(createCard(r, false))
  );

  const approvedReports = reports.filter(r => r.status === "approved");
  const rejectedReports = reports.filter(r => r.status === "rejected");

  approvedReports.forEach(r =>
    approved.appendChild(createCard(r, false))
  );

  rejectedReports.forEach(r =>
    rejected.appendChild(createCard(r, false))
  );

  }

  

/* =========================
   SEVERITY LEVEL
========================= */

function severity(score) {

  if (score >= 0.8) return { label: "HIGH", class: "severity-high" };
  if (score >= 0.5) return { label: "MEDIUM", class: "severity-medium" };

  return { label: "LOW", class: "severity-low" };

}

/* =========================
   CREATE REPORT CARD
========================= */

function createCard(report, isFlagged) {

  const card = document.createElement("div");
  card.className = "moderation-card";

  let severityHTML = "";

  if (isFlagged && report.toxicity_score) {

    const s = severity(report.toxicity_score);
    card.classList.add(s.class);
    severityHTML = `
      <div class="severity ${s.class}">
        ${s.label} TOXICITY
      </div>
    `;
  }

  card.innerHTML = `

    <h4 class="report-title">${report.title}</h4>

    <p class="report-desc">
    ${report.description.substring(0,120)}...
    </p>

        <p class="report-user">User ${report.user_id}</p>

        ${severityHTML}

        <div class="moderation-actions">

          <button onclick="window.openModal(${report.id})">
            View
          </button>

      ${
        isFlagged
          ? `
          <button class="btn approve" onclick="approveReport(${report.id})">
            Approve
          </button>

          <button class="btn reject" onclick="rejectReport(${report.id})">
            Reject
          </button>
          `
          : `
          <button class="btn reject" onclick="rejectReport(${report.id})">
            Reject
          </button>
          `
      }

    </div>
  `;

  return card;

}

/* =========================
   APPROVE REPORT
========================= */

window.approveReport = async function(id) {

  const token = getToken();

  await fetch(`${API_BASE}/reports/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status: "approved" })
  });

  if (window.location.pathname.includes("moderation-full")) {
    if (typeof loadFull === "function") {
      loadFull();
    }
  } else {
    loadModeration();
  }

}

/* =========================
   REJECT REPORT
========================= */

window.rejectReport = async function(id) {

  const token = getToken();

  await fetch(`${API_BASE}/reports/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status: "rejected" })
  });

  if (window.location.pathname.includes("moderation-full")) {
    if (typeof loadFull === "function") {
      loadFull();
    }
  } else {
    loadModeration();
  }

}


/* =========================
   SCROLL CAROUSEL
========================= */

function scrollRow(id, dir) {

const row = document.getElementById(id);
const firstCard = row.querySelector(".moderation-card");

  if (!firstCard) return; // ✅ prevent crash
const cardWidth = firstCard.offsetWidth + 20;

row.scrollBy({
left: dir * cardWidth,
behavior: "smooth"
});

}

function toggleFlagged() {
  showAllFlagged = !showAllFlagged;
  loadModeration();
}

function toggleRecent() {
  showAllRecent = !showAllRecent;
  loadModeration();
}


/* =========================
   INIT
========================= */
window.closeModal = function() {
  document.getElementById("reviewModal").style.display = "none";
}

if (!window.location.pathname.includes("moderation-full")) {
  document.addEventListener("DOMContentLoaded", () => {
    loadModeration();

    document.getElementById("reviewModal").addEventListener("click", (e) => {
      if (e.target.id === "reviewModal") {
        closeModal();
      }
    });
  });
}

window.openModal = function(id) {

  const report = allReports.find(r => r.id === id);

  if (!report) {
    console.error("Report not found:", id);
    return;
  }

  document.getElementById("modalTitle").textContent = report.title || "-";
  document.getElementById("modalDescription").textContent = report.description || "-";
  document.getElementById("modalLocation").textContent = report.location || "-";
  document.getElementById("modalSeverity").textContent = report.status || "-";

  const img = document.getElementById("modalImage");

  if (report.image_path) {
    img.src = `http://127.0.0.1:8000/${report.image_path}`;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }

  document.getElementById("reviewModal").style.display = "flex";

  document.getElementById("approveBtn").onclick = () => approveReport(report.id);
  document.getElementById("rejectBtn").onclick = () => rejectReport(report.id);
};