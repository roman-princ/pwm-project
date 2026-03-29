(async function initAllEventsPage() {
  // --- State Management ---
  let allEventsContent = {
    pageTitle: "All Events",
    filterLabel: "Filter by category",
  };

  let allEvents = []; // The full list from DB
  let filteredEvents = []; // The list after category filtering
  let visibleCount = 7; // Show the first 7 from db

  // multiselect
  let activeFilters = new Set(["all events"]);

  // load page content
  if (typeof DataService !== "undefined") {
    try {
      const data = await DataService.getPageContent("allEvents");
      allEventsContent = { ...allEventsContent, ...data };
    } catch (e) {
      console.warn(
        "AllEvents: could not load content from db.json, using defaults.",
        e,
      );
    }
  }

  setPageContent(allEventsContent);
  createFilterTags("categoryFilters", allEventsContent.pageTitle);

  // render initial events
  if (typeof DataService !== "undefined") {
    try {
      // Get upcoming events from today onward
      allEvents = await DataService.getUpcomingEvents();
      filteredEvents = allEvents;
    } catch (e) {
      console.warn("AllEvents: could not load events from db.json.", e);
    }
  }

  const container = document.getElementById("eventsContainer");
  const seeMoreBtnContainer = document.getElementById("seeMoreBtnContainer");

  // helper to handle the "Load More" button and rendering
  const updateDisplay = () => {
    if (!container) return;

    container.innerHTML = "";

    // Take only the amount specified by visibleCount
    const itemsToRender = filteredEvents.slice(0, visibleCount);

    if (itemsToRender.length > 0) {
      renderEventCards(itemsToRender, container);
    } else {
      container.innerHTML = "<p class='events-empty-msg'>No events found.</p>";
    }

    // handle see more button
    if (seeMoreBtnContainer) {
      seeMoreBtnContainer.innerHTML = "";
      // Only show button if there are more events left in the filtered list
      if (visibleCount < filteredEvents.length) {
        const btn = document.createElement("button");
        btn.className = "btn btn--outline";
        btn.textContent = "See more";
        btn.onclick = () => {
          visibleCount += 7; // Load the next 7
          updateDisplay();
        };
        seeMoreBtnContainer.appendChild(btn);
      }
    }
  };

  // Initial render
  updateDisplay();

  // filtering
  const filterContainer = document.getElementById("categoryFilters");

  if (filterContainer) {
    filterContainer.addEventListener("click", (e) => {
      const clickedBtn = e.target.closest("button");
      if (!clickedBtn) return;

      const selectedCategory = clickedBtn.textContent.trim().toLowerCase();

      // active filters logic
      if (selectedCategory === "all events") {
        activeFilters.clear();
        activeFilters.add("all events");
      } else {
        activeFilters.delete("all events");
        if (activeFilters.has(selectedCategory)) {
          activeFilters.delete(selectedCategory);
        } else {
          activeFilters.add(selectedCategory);
        }
        if (activeFilters.size === 0) {
          activeFilters.add("all events");
        }
      }

      // update button styles
      const allBtns = filterContainer.querySelectorAll(".filter-tag");
      allBtns.forEach((btn) => {
        const btnCategory = btn.textContent.trim().toLowerCase();
        if (activeFilters.has(btnCategory)) {
          btn.classList.add("filter-tag--active");
        } else {
          btn.classList.remove("filter-tag--active");
        }
      });

      // filter data
      if (activeFilters.has("all events")) {
        filteredEvents = allEvents;
      } else {
        filteredEvents = allEvents.filter((event) =>
          activeFilters.has(event.category.toLowerCase()),
        );
      }

      // re-render ui
      visibleCount = 7; // reset to first 7 when filter changes
      updateDisplay();
    });
  }

  if (typeof window.loadIncludes === "function") {
    await window.loadIncludes();
  }
})();
