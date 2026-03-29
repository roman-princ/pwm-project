// Load about page content from db.json via DataService
(async function initAboutPage() {
  let aboutContent = {
    aboutTitle: "Erasmus Events - Las Palmas",
    aboutSubtitle: "Discover and join amazing events with fellow students",
    aboutHeading: "About us",
    aboutDescription:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.",
  };

  if (typeof DataService !== "undefined") {
    try {
      const data = await DataService.getPageContent("about");
      aboutContent = { ...aboutContent, ...data };
    } catch (e) {
      console.warn(
        "About: could not load content from db.json, using defaults.",
        e,
      );
    }
  }

  setPageContent(aboutContent);
})();
