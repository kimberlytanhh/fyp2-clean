document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("toggleSidebar");
  const sidebar = document.getElementById("adminSidebar");

  if (!btn || !sidebar) return;

  btn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
});