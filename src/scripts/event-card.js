const eventsData = [
  {
    id: 1,
    title: "Lorem Ipsum Dolor",
    category: "social",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat.",
    date: "2026-02-25",
    dateFormatted: "Wednesday, February 25, 2026",
    time: "19:00",
    location: "Lorem ipsum",
    image: null,
  },
  {
    id: 2,
    title: "Sit Amet Consectetur",
    category: "cultural",
    description:
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud.",
    date: "2026-02-25",
    dateFormatted: "Wednesday, February 25, 2026",
    time: "18:00",
    location: "Dolor sit amet",
    image: null,
  },
  {
    id: 3,
    title: "Adipiscing Elit Sed",
    category: "language",
    description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    date: "2026-02-26",
    dateFormatted: "Thursday, February 26, 2026",
    time: "10:00",
    location: "Consectetur adipiscing",
    image: null,
  },
  {
    id: 4,
    title: "Tempor Incididunt Ut",
    category: "language",
    description:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    date: "2026-02-26",
    dateFormatted: "Thursday, February 26, 2026",
    time: "11:00",
    location: "Labore et dolore",
    image: null,
  },
  {
    id: 5,
    title: "Magna Aliqua Enim",
    category: "academic",
    description:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    date: "2026-02-28",
    dateFormatted: "Saturday, February 28, 2026",
    time: "14:00",
    location: "Veniam quis nostrud",
    image: null,
  },
  {
    id: 6,
    title: "Exercitation Ullamco",
    category: "sports",
    description:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni.",
    date: "2026-02-28",
    dateFormatted: "Saturday, February 28, 2026",
    time: "16:00",
    location: "Ipsum quia dolor",
    image: null,
  },
  {
    id: 7,
    title: "Quis Nostrud Tempor",
    category: "social",
    description:
      "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas vestibulum.",
    date: "2026-03-01",
    dateFormatted: "Sunday, March 1, 2026",
    time: "20:00",
    location: "Egestas vestibulum",
    image: null,
  },
  {
    id: 8,
    title: "Faucibus Vitae Aliquet",
    category: "sports",
    description:
      "Curabitur gravida arcu ac tortor dignissim convallis aenean et tortor at risus viverra adipiscing.",
    date: "2026-03-01",
    dateFormatted: "Sunday, March 1, 2026",
    time: "09:00",
    location: "Tortor dignissim",
    image: null,
  },
  {
    id: 9,
    title: "Viverra Adipiscing At",
    category: "cultural",
    description:
      "Amet consectetur adipiscing elit duis tristique sollicitudin nibh sit amet commodo nulla facilisi.",
    date: "2026-03-03",
    dateFormatted: "Tuesday, March 3, 2026",
    time: "17:00",
    location: "Nibh sit amet",
    image: null,
  },
  {
    id: 10,
    title: "Tristique Sollicitudin",
    category: "academic",
    description:
      "Eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in.",
    date: "2026-03-05",
    dateFormatted: "Thursday, March 5, 2026",
    time: "15:00",
    location: "Diam quis enim",
    image: null,
  },
];

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
