const headerContent = {
  navAllEvents: "All Events",
  navAbout: "About us",
  createEventLink: "Create Event",
  loginText: "Login",
  logoutBtn: "Log out",
};

Object.entries(headerContent).forEach(([id, text]) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
});

const searchInput = document.getElementById("searchInput");
if (searchInput) searchInput.placeholder = "Search";

const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
const loginLink = document.getElementById("loginLink");
const logoutBtn = document.getElementById("logoutBtn");
const createEventLink = document.getElementById("createEventLink");

if (isLoggedIn) {
  if (loginLink) loginLink.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "block";
  if (createEventLink) createEventLink.style.display = "block";
} else {
  if (loginLink) loginLink.style.display = "flex";
  if (logoutBtn) logoutBtn.style.display = "none";
  if (createEventLink) createEventLink.style.display = "none";
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/src/pages/index.html";
  });
}
