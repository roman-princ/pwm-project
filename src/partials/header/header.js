// Load header content from db.json via DataService
(async function initHeader() {
  let headerContent = {
    navAllEvents: "All Events",
    navAbout: "About us",
    createEventLink: "Create Event",
    loginText: "Login",
    logoutBtn: "Log out",
    searchPlaceholder: "Search",
  };

  if (typeof DataService !== "undefined") {
    try {
      const data = await DataService.getPartialContent("header");
      headerContent = { ...headerContent, ...data };
    } catch (e) {
      console.warn(
        "Header: could not load content from db.json, using defaults.",
        e,
      );
    }
  }

  Object.entries(headerContent).forEach(([id, text]) => {
    if (id === "searchPlaceholder") return;
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  });

  const searchInput = document.getElementById("searchInput");
  if (searchInput)
    searchInput.placeholder = headerContent.searchPlaceholder || "Search";

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole") || "user";
  const loginLink = document.getElementById("loginLink");
  const logoutBtn = document.getElementById("logoutBtn");
  const createEventLink = document.getElementById("createEventLink");
  const brandLink = document.querySelector(".header__brand-link");

  if (isLoggedIn) {
    if (loginLink) loginLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";
    if (createEventLink)
      createEventLink.style.display = userRole === "admin" ? "inline" : "none";
    if (brandLink) brandLink.href = "/src/pages/admin-home/admin-home.html";
  } else {
    if (loginLink) loginLink.style.display = "flex";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (createEventLink) createEventLink.style.display = "none";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      window.location.href = "/src/pages/index.html";
    });
  }

  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navActions = document.getElementById('navActions');

  if (hamburgerBtn && navActions) {
    hamburgerBtn.addEventListener('click', () => {
      navActions.classList.toggle('is-open');
      hamburgerBtn.classList.toggle('is-active');
    });
  }
})();
