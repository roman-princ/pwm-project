const backBtnContainer = document.getElementById("backBtn");
if (backBtnContainer) backBtnContainer.appendChild(createBackButton(24, 2));

// Load registration page content from db.json
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

// ── Client-side form validation ────────────────────────────

/**
 * Show an inline error message for a given field.
 */
function showFieldError(fieldId, message) {
  const errorEl = document.getElementById(fieldId + "Error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
  const input = document.getElementById(fieldId);
  if (input) input.classList.add("input--invalid");
}

/**
 * Clear the inline error for a given field.
 */
function clearFieldError(fieldId) {
  const errorEl = document.getElementById(fieldId + "Error");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.style.display = "none";
  }
  const input = document.getElementById(fieldId);
  if (input) input.classList.remove("input--invalid");
}

/**
 * Validate the entire registration form.
 * Returns true if valid, false otherwise.
 */
function validateRegistrationForm() {
  let isValid = true;
  const fields = [
    "firstName",
    "surname",
    "email",
    "username",
    "password",
    "passwordConfirm",
  ];

  // Clear previous errors
  fields.forEach(clearFieldError);

  const firstName = document.getElementById("firstName");
  if (firstName && !firstName.validity.valid) {
    showFieldError(
      "firstName",
      firstName.validationMessage || "Please enter a valid first name.",
    );
    isValid = false;
  }

  const surname = document.getElementById("surname");
  if (surname && !surname.validity.valid) {
    showFieldError(
      "surname",
      surname.validationMessage || "Please enter a valid surname.",
    );
    isValid = false;
  }

  const email = document.getElementById("email");
  if (email && !email.validity.valid) {
    showFieldError(
      "email",
      email.validationMessage || "Please enter a valid e-mail.",
    );
    isValid = false;
  }

  const username = document.getElementById("username");
  if (username && !username.validity.valid) {
    showFieldError(
      "username",
      username.validationMessage || "Please enter a valid username.",
    );
    isValid = false;
  }

  const password = document.getElementById("password");
  if (password && !password.validity.valid) {
    showFieldError(
      "password",
      "Password must be at least 8 characters with uppercase, lowercase and a number.",
    );
    isValid = false;
  }

  const passwordConfirm = document.getElementById("passwordConfirm");
  if (password && passwordConfirm && password.value !== passwordConfirm.value) {
    showFieldError("passwordConfirm", "Passwords do not match.");
    isValid = false;
  } else if (passwordConfirm && !passwordConfirm.validity.valid) {
    showFieldError(
      "passwordConfirm",
      passwordConfirm.validationMessage || "Please confirm your password.",
    );
    isValid = false;
  }

  return isValid;
}

// ── Form submission ────────────────────────────────────────

const registerForm = document.querySelector(".register__form");

if (registerForm) {
  // Live validation: clear errors on input
  registerForm.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => clearFieldError(input.id));
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateRegistrationForm()) return;

    const userData = {
      firstName: document.getElementById("firstName").value.trim(),
      surname: document.getElementById("surname").value.trim(),
      email: document.getElementById("email").value.trim(),
      organization: document.getElementById("organization").value.trim(),
      username: document.getElementById("username").value.trim(),
      password: document.getElementById("password").value,
    };

    if (typeof DataService !== "undefined") {
      try {
        await DataService.registerUser(userData);
        alert("Registration successful! You can now log in.");
        window.location.href = "/src/pages/login/login.html";
      } catch (err) {
        // Show server-side errors (duplicate username/email)
        if (err.message.includes("Username")) {
          showFieldError("username", err.message);
        } else if (err.message.includes("mail")) {
          showFieldError("email", err.message);
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
