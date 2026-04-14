function confirmLogout(){
  document.getElementById("logoutModal").style.display = "flex";
}

function closeLogout(){
  document.getElementById("logoutModal").style.display = "none";
}

function logout(){
  localStorage.clear();
  window.location.href = "../login.html";
}