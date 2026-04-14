const API_BASE = "http://127.0.0.1:8000";
const REPORTS_API = `${API_BASE}/reports`;

let reportsCache = [];

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("access_token")
  );
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

function formatCategory(value) {
  if (!value) return "Unconfirmed";
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function confidenceClass(confidence) {
  if (confidence == null) return "";
  return confidence >= 0.6 ? "confidence-high" : "confidence-low";
}

async function loadReports() {
  const tbody = document.querySelector("#reportsTable tbody");

  try {
    const res = await fetch(`${REPORTS_API}/admin/all`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (res.status === 401) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5">Unauthorized. Please log in as admin.</td>
        </tr>
      `;
      console.error("401 Unauthorized when loading reports.");
      return;
    }

    if (!res.ok) {
      throw new Error(`Failed to load reports: ${res.status}`);
    }

    const data = await res.json();
    reportsCache = data;
    tbody.innerHTML = "";

    if (!data.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5">No reports found.</td>
        </tr>
      `;
      return;
    }

    data.forEach((r) => {
      const row = document.createElement("tr");

      const aiCategory = r.image_category ?? r.text_category ?? null;
      const confidence = r.image_confidence ?? r.text_confidence ?? null;
      const finalCategory = r.final_category ?? aiCategory ?? null;

      row.innerHTML = `
        <td>${r.title ?? "-"}</td>
        <td>${formatCategory(aiCategory)}</td>
        <td class="${confidenceClass(confidence)}">
          ${confidence != null ? `${(confidence * 100).toFixed(1)}%` : "N/A"}
        </td>
        <td>
          <select id="cat-${r.id}">
            <option value="road_damage" ${finalCategory === "road_damage" ? "selected" : ""}>Road Damage</option>
            <option value="flood_drainage" ${finalCategory === "flood_drainage" ? "selected" : ""}>Flood Drainage</option>
            <option value="garbage" ${finalCategory === "garbage" ? "selected" : ""}>Garbage</option>
            <option value="infrastructure_damage" ${finalCategory === "infrastructure_damage" ? "selected" : ""}>Infrastructure Damage</option>
            <option value="obstruction_fallen_tree" ${finalCategory === "obstruction_fallen_tree" ? "selected" : ""}>Obstruction Fallen Tree</option>
            <option value="accident" ${finalCategory === "accident" ? "selected" : ""}>Accident</option>
            <option value="police_sighting" ${finalCategory === "police_sighting" ? "selected" : ""}>Police Sighting</option>

            <option value="other" ${finalCategory === "other" ? "selected" : ""}>Other</option>
          </select>
        </td>
        <td>
          <button onclick="viewReport(${r.id})">View</button>
          <button onclick="confirmCategory(${r.id})">Confirm</button>
          <button onclick="deleteReport(${r.id})">Delete</button>
        </td>
      `;

      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading reports:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="5">Failed to load reports.</td>
      </tr>
    `;
  }
}

async function confirmCategory(id) {
  const category = document.getElementById(`cat-${id}`).value;

  try {
    const res = await fetch(`${REPORTS_API}/${id}/category`, {
      method: "PATCH",
      headers: authHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ final_category: category }),
    });

    if (res.status === 401) {
      alert("Unauthorized. Please log in as admin.");
      return;
    }

    if (!res.ok) {
      throw new Error(`Failed to update category: ${res.status}`);
    }

    alert("Category updated.");
    loadReports();
  } catch (error) {
    console.error("Error updating category:", error);
    alert("Failed to update category.");
  }
}

async function deleteReport(id) {
  if (!confirm("Delete this report?")) return;

  try {
    const res = await fetch(`${REPORTS_API}/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (res.status === 401) {
      alert("Unauthorized. Please log in as admin.");
      return;
    }

    if (!res.ok) {
      throw new Error(`Failed to delete report: ${res.status}`);
    }

    loadReports();
  } catch (error) {
    console.error("Error deleting report:", error);
    alert("Failed to delete report.");
  }
}

loadReports();

function viewReport(id) {

  const report = reportsCache.find(r => r.id === id);

  if (!report) {
    console.error("Report not found");
    return;
  }

  document.getElementById("viewTitle").textContent = report.title || "-";
  document.getElementById("viewDescription").textContent = report.description || "-";
  document.getElementById("viewLocation").textContent = report.location || "-";

  const category =
    report.final_category ||
    report.image_category ||
    report.text_category ||
    "Unconfirmed";

  document.getElementById("viewCategory").textContent =
    category.replaceAll("_", " ");

  const img = document.getElementById("viewImage");

  if (report.image_path) {
    img.src = `http://127.0.0.1:8000/${report.image_path}`;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }

  document.getElementById("viewModal").style.display = "flex";
}

function closeViewModal() {
  document.getElementById("viewModal").style.display = "none";
}

document.getElementById("viewModal").addEventListener("click", (e) => {
  if (e.target.id === "viewModal") {
    closeViewModal();
  }
});