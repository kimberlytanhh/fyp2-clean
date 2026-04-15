const STATS_API = "https://fyp2-backend-qp13.onrender.com/reports/admin/stats";

async function loadStats() {

  const token = localStorage.getItem("access_token");

  if (!token) {
    console.error("No token found. Please login again.");
    return;
  }

  const res = await fetch(STATS_API, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Failed to fetch admin stats", res.status);
    return;
  }

  const stats = await res.json();

  document.getElementById("totalReports").innerText = stats.total_reports;
  document.getElementById("pendingReview").innerText = stats.pending_review;
  document.getElementById("resolved").innerText = stats.resolved;
}

document.addEventListener("DOMContentLoaded", loadStats);