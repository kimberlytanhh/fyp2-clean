const STATS_API = "https://fyp2-backend-qp13.onrender.com/reports/admin/summary";
const REPORTS_API = "https://fyp2-backend-qp13.onrender.com/reports/admin/all";

async function loadStats() {
  const token = localStorage.getItem("access_token");

  if (!token) return;

  const res = await fetch(STATS_API, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  document.getElementById("totalReports").innerText = data.total_reports;
  document.getElementById("pendingReview").innerText = data.pending_review;

  // status counts
  document.getElementById("flagged").innerText = data.status_counts.flagged || 0;
  document.getElementById("approved").innerText = data.status_counts.approved || 0;
  document.getElementById("rejected").innerText = data.status_counts.rejected || 0;
}

async function loadReports() {
  const token = localStorage.getItem("access_token");
  if (!token) return;

  const res = await fetch(REPORTS_API, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const reports = await res.json();

  // SORT newest
  reports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // ===== LATEST 3 =====
  const latest = reports.slice(0, 3);
  const latestList = document.getElementById("latestReports");
  latestList.innerHTML = "";

  latest.forEach(r => {
    latestList.innerHTML += `
      <li>
        ${r.title} <br>
        <small>${r.status}</small>
      </li>
    `;
  });

  // ===== ACTIVITY =====
  const activity = document.getElementById("activityFeed");
  activity.innerHTML = "";

  const recent = reports.slice(0, 5);

  recent.forEach(r => {
    activity.innerHTML += `
      <li>📌 "${r.title}" submitted</li>
    `;
  });

  // ===== TODAY COUNTS =====
  const today = new Date().toDateString();

  const todayReports = reports.filter(r =>
    new Date(r.created_at).toDateString() === today
  ).length;

  document.getElementById("totalToday").innerText = `+${todayReports} today`;
}

document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadReports();
});