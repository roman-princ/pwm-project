const backBtnContainer = document.getElementById("backBtn");
if (backBtnContainer) backBtnContainer.appendChild(createBackButton(24, 2));

setPageContent({
  loginHeading: "Log in",
  usernameLabel: "Username:",
  passwordLabel: "Password:",
  registrationLink: "Registration?",
  loginSubmitBtn: "Log in",
});

const loginForm = document.querySelector(".login__form");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username && password) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", username);

      alert("Login successful!");
      window.location.href = "/src/pages/admin-home/admin-home.html";
    } else {
      alert("Please enter both username and password.");
    }
  });
}
