const backBtnContainer = document.getElementById("backBtn");
if (backBtnContainer) backBtnContainer.appendChild(createBackButton(24, 2));

// Load login page content from db.json
(async function initLoginPage() {
  let loginContent = {
    loginHeading: "Log in",
    usernameLabel: "Username:",
    passwordLabel: "Password:",
    registrationLink: "Registration?",
    loginSubmitBtn: "Log in",
  };

  if (typeof DataService !== "undefined") {
    try {
      const data = await DataService.getPageContent("login");
      loginContent = { ...loginContent, ...data };
    } catch (e) {
      console.warn(
        "Login: could not load content from db.json, using defaults.",
        e,
      );
    }
  }

  setPageContent(loginContent);
})();

const loginForm = document.querySelector(".login__form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    if (typeof DataService !== "undefined") {
      try {
        const user = await DataService.authenticate(username, password);
        if (user) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("username", user.username);
          localStorage.setItem("userRole", user.role);
          localStorage.setItem("userId", String(user.id));
          alert("Login successful!");
          window.location.href = "/src/pages/admin-home/admin-home.html";
        } else {
          alert("Invalid username or password.");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("An error occurred during login. Please try again.");
      }
    } else {
      // Fallback if DataService not loaded
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", username);
      alert("Login successful!");
      window.location.href = "/src/pages/admin-home/admin-home.html";
    }
  });
}
