const backBtnContainer = document.getElementById("backBtn");
if (backBtnContainer) backBtnContainer.appendChild(createBackButton(24, 2));

setPageContent({
  registerHeading: "Registration",
  firstNameLabel: "First Name:",
  surnameLabel: "Surname:",
  emailLabel: "E-mail:",
  organizationLabel: "Organization:",
  passwordLabel: "Password:",
  passwordConfirmLabel: "Password again:",
  registerSubmitBtn: "Register",
});
