const API_BASE = "https://fyp2-backend-qp13.onrender.com";

// ================= TOKEN =================
function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("access_token")
  );
}

// ================= FORMAT =================
function formatCategory(value) {
  if (!value) return "Unconfirmed";
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ================= SAFE FETCH =================
async function fetchWithAuth(url) {
  const token = getToken();

  if (!token) {
    console.error("❌ No token found. Please login again.");
    return null;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error(`❌ Request failed: ${res.status}`, url);
    return null;
  }

  return res.json();
}

// ================= KPI =================
async function loadStats() {
  const data = await fetchWithAuth(`${API_BASE}/reports/admin/stats`);
  if (!data) return;

  document.getElementById("totalReports").textContent =
    data.total_reports ?? data.total ?? "-";

  document.getElementById("pendingReports").textContent =
    data.pending_review ?? data.pending ?? "-";
}

// ================= CATEGORY CHART =================
async function loadCategoryChart() {
  const data = await fetchWithAuth(`${API_BASE}/reports/admin/analytics/categories`);
  if (!data) return;
  console.log("CATEGORY DATA:", data);
  new Chart(document.getElementById("categoryChart"), {
    type: "bar",
    data: {
      labels: data.labels.map(formatCategory),
      datasets: [{
        label: "Reports",
        data: data.counts
      }]
    },
    options: { responsive: true }
  });
}

// ================= MAP =================
async function loadMap() {
  const map = L.map('map').setView([4.3340, 101.1350], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const data = await fetchWithAuth(`${API_BASE}/reports/map`);
  if (!data) return;
  const heatPoints = [];
  const markers = L.markerClusterGroup();

  data.forEach(report => {
    if (!report.latitude || !report.longitude) return;

    // 🔥 ADD FOR HEATMAP
    heatPoints.push([report.latitude, report.longitude, 0.5]);

    const marker = L.marker([report.latitude, report.longitude]);

    marker.bindPopup(`
      <strong>${report.title}</strong><br/>
      Category: ${formatCategory(report.category)}<br/>
      Status: ${report.status}
    `);

    markers.addLayer(marker);
  });

  map.addLayer(markers);
  L.heatLayer(heatPoints, {
    radius: 35,
    blur: 20,
    maxZoom: 17,
    gradient: {
      0.2: 'blue',
      0.4: 'lime',
      0.6: 'yellow',
      0.8: 'orange',
      1.0: 'red'
    }
  }).addTo(map);
}

// ================= AI CONFIDENCE =================
async function loadAIConfidence() {
  const data = await fetchWithAuth(`${API_BASE}/reports/admin/analytics/ai-confidence`);
  if (!data) return;

  const value = data.average_confidence ?? data.avg_confidence ?? 0;

  document.getElementById("avgConfidence").textContent =
    (value * 100).toFixed(1) + "%";
}

// ================= AI AGREEMENT =================
async function loadAgreement() {
  const data = await fetchWithAuth(`${API_BASE}/reports/admin/analytics/ai-agreement`);
  if (!data) return;

  const value = data.agreement_rate ?? data.agreement ?? 0;

  document.getElementById("aiAgreement").textContent =
    value === 0 ? "N/A" : (value * 100).toFixed(1) + "%";
}

// ================= TREND =================
async function loadTrendChart() {
  const data = await fetchWithAuth(`${API_BASE}/reports/admin/analytics/trend`);
  if (!data) return;

  new Chart(document.getElementById("trendChart"), {
    type: "line",
    data: {
      labels: data.dates,
      datasets: [{
        label: "Reports",
        data: data.counts
      }]
    }
  });
}

// ================= MODEL METRICS =================
async function loadModelMetrics() {
  try {
    const res = await fetch("../assets/data/training_metrics.json");
    const data = await res.json();

    // ✅ Accuracy (your real metric)
    document.getElementById("accuracy").textContent =
      (data.best_validation_accuracy ?? data.accuracy ?? 0).toFixed(1) + "%";

    document.getElementById("precision").textContent =
      data.precision != null ? (data.precision * 100).toFixed(1) + "%" : "-";

    document.getElementById("recall").textContent =
      data.recall != null ? (data.recall * 100).toFixed(1) + "%" : "-";

    document.getElementById("f1").textContent =
      data.f1 != null ? (data.f1 * 100).toFixed(1) + "%" : "-";
      
    // ✅ Model info
    document.getElementById("modelName").textContent =
      "Model: " + (data.model_name || "N/A");

    document.getElementById("lastTrained").textContent =
      "Last trained: " + (data.created_at || "N/A");

  } catch (err) {
    console.error("Model metrics error:", err);
  }
}

// ================= INIT =================
loadStats();
loadCategoryChart();
loadMap();
loadAIConfidence();
loadAgreement();
loadTrendChart();
loadModelMetrics();