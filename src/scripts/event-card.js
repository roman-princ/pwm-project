// Guard: skip if already loaded.
if (typeof createEventCard === "undefined") {
  // eventsData is no longer hardcoded here.
  // Use DataService.getEvents() to fetch events from db.json.

  function createEventCard(event) {
    const el = document.createElement("div");
    el.setAttribute("data-include", "components/event-card/event-card");

    el.dataset.detailUrl = `/src/pages/event-detail/event-detail.html?id=${event.id}`;
    el.dataset.title = event.title;
    el.dataset.category = event.category;
    el.dataset.description = event.description;
    el.dataset.dateFormatted = event.dateFormatted;
    el.dataset.time = event.time;
    el.dataset.location = event.location;
    el.dataset.organizer = event.organizer;

    return el;
  }

  function renderEventCards(events, container) {
    container.innerHTML = "";

    const grouped = {};
    events.forEach((event) => {
      if (!grouped[event.date]) {
        grouped[event.date] = {
          label: event.dateFormatted,
          events: [],
        };
      }
      grouped[event.date].events.push(event);
    });

    Object.keys(grouped)
      .sort()
      .forEach((dateKey) => {
        const group = grouped[dateKey];

        const dateGroup = document.createElement("div");
        dateGroup.className = "date-group";

        const dateHeader = document.createElement("h2");
        dateHeader.className = "date-group__header";
        dateHeader.textContent = group.label;
        dateGroup.appendChild(dateHeader);

        const stack = document.createElement("div");
        stack.className = "date-group__stack";

        group.events.forEach((event) => {
          stack.appendChild(createEventCard(event));
        });

        dateGroup.appendChild(stack);
        container.appendChild(dateGroup);
      });
  }
} // end guard
