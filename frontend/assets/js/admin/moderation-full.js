
let filteredReports = [];

let currentPage = 1;
const perPage = 9; // 3x3

function getToken() {
  return localStorage.getItem("access_token");
}

async function loadFull() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");

  console.log("TYPE:", type);

  const token = getToken();

  const res = await fetch(`${API_BASE}/reports/admin/all`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  console.log("STATUS:", res.status);

  const data = await res.json();

  if (!res.ok) {
    console.error("API ERROR:", data);
    return;
  }

const reports = Array.isArray(data) ? data : [];
  console.log("REPORTS:", reports);

  window.allReports = reports;

  if (type === "flagged") {
    filteredReports = reports.filter(r => r.status === "flagged");
    document.getElementById("pageTitle").innerText = "Flagged Reports";
  }
  else if (type === "approved") {
    filteredReports = reports.filter(r => r.status === "approved");
    document.getElementById("pageTitle").innerText = "Approved Reports";
  }
  else if (type === "rejected") {
    filteredReports = reports.filter(r => r.status === "rejected");
    document.getElementById("pageTitle").innerText = "Rejected Reports";
  }
  else {
    filteredReports = reports.filter(r => r.status !== "flagged");
    document.getElementById("pageTitle").innerText = "Recent Reports";
  }

  currentPage = 1;
  renderPage();
}

function renderPage() {
  const container = document.getElementById("fullReports");
  container.innerHTML = "";

  if (!filteredReports || filteredReports.length === 0) {
    container.innerHTML = "<p>No reports found.</p>";
    document.getElementById("pageInfo").innerText = "";
    return;
  }

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;

  const pageData = filteredReports.slice(start, end);

  pageData.forEach(r => {
    const isFlagged = r.status === "flagged";
    container.appendChild(createCard(r, isFlagged));
  });

  const totalPages = Math.ceil(filteredReports.length / perPage);

  document.getElementById("pageInfo").innerText =
    `Page ${currentPage} / ${totalPages}`;
}

function nextPage() {
  const totalPages = Math.ceil(filteredReports.length / perPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderPage();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
  }
}

document.addEventListener("DOMContentLoaded", loadFull);

function refreshAfterAction() {
  loadFull(); // reload full page data
}