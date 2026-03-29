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

    // standart html validation
    if (!loginForm.checkValidity()) {
      loginForm.classList.add("was-validated");

      // Focus the first invalid input so the user knows where to fix
      const firstInvalid = loginForm.querySelector(":invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // custom validation
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username) {
      usernameInput.setCustomValidity("Username cannot be just spaces.");
      usernameInput.reportValidity();
      loginForm.classList.add("was-validated");
      return;
    } else {
      usernameInput.setCustomValidity("");
    }

    // authentication
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
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", username);
      alert("Login successful!");
      window.location.href = "/src/pages/admin-home/admin-home.html";
    }
  });
}