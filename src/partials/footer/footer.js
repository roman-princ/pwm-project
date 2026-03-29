// Load footer content from db.json via DataService
(async function initFooter() {
  let footerContent = {
    footerAddress: "Adress",
    footerPhone: "+34 666 666 666",
    footerFacebook: "erasmus_las_palmas",
    footerInstagram: "@erasmus_las_palmas",
    footerX: "erasmus_las_palmas",
    footerCopyright: "© Copyright",
  };

  if (typeof DataService !== "undefined") {
    try {
      const data = await DataService.getPartialContent("footer");
      footerContent = { ...footerContent, ...data };
    } catch (e) {
      console.warn(
        "Footer: could not load content from db.json, using defaults.",
        e,
      );
    }
  }

  Object.entries(footerContent).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  });
})();
