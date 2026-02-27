const initEventsPage = () => {
  const categoryContainer = document.querySelector("#categoryFilters");

  if (categoryContainer) {
    categoryContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-tag");
      if (!btn) return;

      const allTags = categoryContainer.querySelectorAll(".filter-tag");
      const isAllEventsBtn = btn.textContent.trim() === "All Events";

      if (isAllEventsBtn) {
        allTags.forEach((t) => t.classList.remove("filter-tag--active"));
        btn.classList.add("filter-tag--active");
      } else {
        btn.classList.toggle("filter-tag--active");
        allTags[0].classList.remove("filter-tag--active");

        const anyActive = Array.from(allTags).some((t) =>
          t.classList.contains("filter-tag--active"),
        );
        if (!anyActive) allTags[0].classList.add("filter-tag--active");
      }

      console.log(
        "Active Filters:",
        Array.from(allTags)
          .filter((t) => t.classList.contains("filter-tag--active"))
          .map((t) => t.textContent.trim()),
      );
    });
  }
};

const observer = new MutationObserver((mutations, obs) => {
  const filtersLoaded = document.querySelector("#categoryFilters");
  if (filtersLoaded) {
    initEventsPage();
    obs.disconnect();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
