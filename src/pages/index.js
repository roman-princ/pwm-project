const mainPageContent = {
  heroTitle: "Welcome to Las Palmas",
  heroDescription:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.",
  eventsHeading: "Coming soon",
};

const mainPageEl = document.getElementById("mainPage");
if (mainPageEl) {
  Object.entries(mainPageContent).forEach(([key, value]) => {
    mainPageEl.dataset[key] = value;
  });
}
