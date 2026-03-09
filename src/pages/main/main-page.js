const MAX_HOME_EVENTS = 4;

async function renderHomeEvents() {
  const container = document.getElementById("eventList");
  if (!container) return;

  let events = [];
  if (typeof DataService !== "undefined") {
    try {
      events = await DataService.getEvents();
    } catch (e) {
      console.warn("Home: could not load events from db.json.", e);
    }
  }

  const upcoming = events.slice(0, MAX_HOME_EVENTS);

  upcoming.forEach((event) => {
    container.appendChild(createEventCard(event));
  });

  const ctaContainer = document.getElementById("allEventsBtnContainer");
  if (ctaContainer) {
    ctaContainer.appendChild(
      createButton(
        "/src/pages/all-events/all-events.html",
        "outline",
        "All Events",
      ),
    );
  }

  // Process the newly-added data-include elements (event cards, buttons).
  if (typeof window.loadIncludes === "function") {
    await window.loadIncludes();
  }
}

renderHomeEvents();
