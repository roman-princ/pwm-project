const footerContent = {
  footerAddress: "Adress",
  footerPhone: "+34 666 666 666",
  footerFacebook: "erasmus_las_palmas",
  footerInstagram: "@erasmus_las_palmas",
  footerX: "erasmus_las_palmas",
  footerCopyright: "© Copyright",
};

Object.entries(footerContent).forEach(([id, text]) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
});
