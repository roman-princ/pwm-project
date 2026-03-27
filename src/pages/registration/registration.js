const backBtnContainer = document.getElementById("backBtn");
if (backBtnContainer) backBtnContainer.appendChild(createBackButton(24, 2));

(async function initRegistrationPage() {
  let regContent = {
    registerHeading: "Registration",
    firstNameLabel: "First Name:",
    surnameLabel: "Surname:",
    emailLabel: "E-mail:",
    organizationLabel: "Organization:",
    usernameLabel: "Username:",
    passwordLabel: "Password:",
    passwordConfirmLabel: "Password again:",
    registerSubmitBtn: "Register",
  };

  if (typeof DataService !== "undefined") {
    try {
      const data = await DataService.getPageContent("registration");
      regContent = { ...regContent, ...data };
    } catch (e) {
      console.warn(
        "Registration: could not load content from db.json, using defaults.",
        e,
      );
    }
  }

  setPageContent(regContent);
})();

const registerForm = document.querySelector(".register__form");

if (registerForm) {
  registerForm.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      input.setCustomValidity("");

      const errorSpan = document.getElementById(`${input.id}Error`);
      if (errorSpan && input.title) {
        errorSpan.textContent = input.title;
      }
    });
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("password");
    const passwordConfirm = document.getElementById("passwordConfirm");

    // custom validation
    if (password.value !== passwordConfirm.value) {
      passwordConfirm.setCustomValidity("Passwords do not match.");
      const confirmErrorSpan = document.getElementById("passwordConfirmError");
      if (confirmErrorSpan) confirmErrorSpan.textContent = "Passwords do not match.";
    } else {
      passwordConfirm.setCustomValidity("");
    }

    // standard html validation
    if (!registerForm.checkValidity()) {
      registerForm.classList.add("was-validated");

      const firstInvalid = registerForm.querySelector(":invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // valid - prepare data
    const userData = {
      firstName: document.getElementById("firstName").value.trim(),
      surname: document.getElementById("surname").value.trim(),
      email: document.getElementById("email").value.trim(),
      organization: document.getElementById("organization").value.trim(),
      username: document.getElementById("username").value.trim(),
      password: password.value,
    };

    // sent
    if (typeof DataService !== "undefined") {
      try {
        await DataService.registerUser(userData);
        alert("Registration successful! You can now log in.");
        window.location.href = "/src/pages/login/login.html";
      } catch (err) {
        registerForm.classList.add("was-validated");

        if (err.message.includes("Username")) {
          const usernameInput = document.getElementById("username");
          const usernameError = document.getElementById("usernameError");
          usernameInput.setCustomValidity("Username already taken.");
          if (usernameError) usernameError.textContent = err.message;
          usernameInput.focus();
        } else if (err.message.includes("mail")) {
          const emailInput = document.getElementById("email");
          const emailError = document.getElementById("emailError");
          emailInput.setCustomValidity("Email already in use.");
          if (emailError) emailError.textContent = err.message;
          emailInput.focus();
        } else {
          alert(err.message);
        }
      }
    } else {
      alert("Registration successful!");
      window.location.href = "/src/pages/login/login.html";
    }
  });
}