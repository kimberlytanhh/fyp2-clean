// =========================
// UI / ANIMATION HELPERS
// =========================
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// === Mobile nav toggle ===
(function () {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#menu");
  if (!toggle || !menu) return;
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    menu.classList.toggle("show");
  });
})();

// =========================
// TOAST / MODAL HELPERS
// =========================
window.showToast = function (message) {
  const toast = document.querySelector(".toast");
  if (!toast) { alert(message); return; }
  const titleEl = toast.querySelector("strong");
  const bodyP = toast.querySelector("p") || document.createElement("p");
  if (!bodyP.parentNode) toast.querySelector(".toast-inner").appendChild(bodyP);
  if (titleEl) titleEl.textContent = "Notice";
  bodyP.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
};

(function () {
  const btn = document.querySelector(".close-toast");
  const toast = document.querySelector(".toast");
  if (btn && toast) btn.addEventListener("click", () => toast.classList.remove("show"));
})();

// =========================
// FLASH MESSAGE (AFTER REDIRECT)
// =========================
document.addEventListener("DOMContentLoaded", () => {
  try {
    const msg = sessionStorage.getItem("flash");
    if (msg) {
      sessionStorage.removeItem("flash");
      showToast(msg);
    }
  } catch {}
});

// =========================
// AUTH (JWT-BASED)
// =========================
function isAuthenticated() {
  return !!localStorage.getItem("access_token");
}

function requireAuth() {
  if (!isAuthenticated()) {
    sessionStorage.setItem("flash", "Please log in to continue.");
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("chat_history");
  localStorage.removeItem("chat_flow");
  localStorage.removeItem("token_type");
  sessionStorage.setItem("flash", "Signed out.");
  window.location.href = "index.html";
}

window.getToken = function () {
  return localStorage.getItem("access_token");
};

window.isAuthenticated = isAuthenticated;
window.requireAuth = requireAuth;
window.logout = logout;

// =========================
// NAVBAR AUTH STATE
// =========================
function updateNavAuth() {
  const menu = document.querySelector("#menu");
  if (!menu) return;

  // Remove old auth buttons only (not main menu)
  menu.querySelectorAll("[data-auth]").forEach(el => el.remove());

  if (isAuthenticated()) {
    const liLogout = document.createElement("li");
    liLogout.setAttribute("data-auth", "1");

    const a = document.createElement("a");
    a.href = "#";
    a.textContent = "Logout";
    a.onclick = (e) => {
      e.preventDefault();
      logout();
    };

    liLogout.appendChild(a);
    menu.appendChild(liLogout);

  } else {
    const liLogin = document.createElement("li");
    liLogin.setAttribute("data-auth", "1");
    liLogin.innerHTML = '<a href="login.html">Login</a>';
    menu.appendChild(liLogin);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateNavAuth();

  // ❌ DO NOT run on login page
  if (!window.location.pathname.includes("login.html")) {
    loadNotificationBadge();
  }
});

// =========================
// PROTECT CREATE REPORT LINK
// =========================
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href$="createreport.html"]');
  if (!a) return;
  if (!isAuthenticated()) {
    e.preventDefault();
    sessionStorage.setItem("flash", "Please log in to create a report.");
    window.location.href = "login.html";
  }
});

// =========================
// FOOTER YEAR
// =========================
(function () {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

async function loadNotificationBadge() {
  if (!isAuthenticated()) return;
  const API = "http://127.0.0.1:8000";
  const res = await fetch(`${API}/notifications/`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  const data = await res.json();
  const unread = data.filter(n => !n.is_read).length;

  const badge = document.getElementById("notifBadge");
  if (!badge) return;

  if (unread > 0) {
    badge.textContent = unread;
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
  }
}

const currentPage = window.location.pathname.split("/").pop();

document.querySelectorAll(".menu a").forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  }
});

async function loadReportCount() {
  try {
    const res = await fetch("http://127.0.0.1:8000/public/count");
    const data = await res.json();

    const el = document.getElementById("reportsCount");
    if (el) el.textContent = data.count;

  } catch (err) {
    console.error("Error loading report count:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadReportCount);
