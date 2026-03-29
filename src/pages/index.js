// Load home page content from db.json via DataService
(async function initHomePage() {
  let mainPageContent = {
    heroTitle: "Welcome to Las Palmas",
    heroDescription:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.",
    eventsHeading: "Coming soon",
  };

  if (typeof DataService !== "undefined") {
    try {
      const data = await DataService.getPageContent("home");
      mainPageContent = { ...mainPageContent, ...data };
    } catch (e) {
      console.warn(
        "Home: could not load content from db.json, using defaults.",
        e,
      );
    }
  }

  const mainPageEl = document.getElementById("mainPage");
  if (mainPageEl) {
    Object.entries(mainPageContent).forEach(([key, value]) => {
      mainPageEl.dataset[key] = value;
    });
  }
})();
