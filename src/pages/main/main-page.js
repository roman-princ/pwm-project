const MAX_HOME_EVENTS = 4;

function renderHomeEvents() {
  const container = document.getElementById("eventList");
  if (!container || typeof eventsData === "undefined") return;

  const upcoming = eventsData.slice(0, MAX_HOME_EVENTS);

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
}

renderHomeEvents();
