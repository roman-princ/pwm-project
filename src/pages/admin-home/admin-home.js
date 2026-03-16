const MAX_ADMIN_EVENTS = 4;

function createAdminEventCard(event) {
  const wrapper = document.createElement("div");
  wrapper.className = "admin-card-wrapper";
  // wrapper.style.maxWidth = "900px";
  // wrapper.style.width = "100%";

  const card = createEventCard(event);
  wrapper.appendChild(card);

  const observer = new MutationObserver(() => {
    const detailsSection = wrapper.querySelector(
      ".event-card__content--details",
    );
    if (detailsSection && !wrapper.querySelector(".event-card__edit-btn")) {
      const editBtn = document.createElement("a");
      editBtn.href = `/src/pages/edit-event/edit-event.html?id=${event.id}`;
      editBtn.className = "event-card__edit-btn";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", (e) => e.stopPropagation());
      detailsSection.appendChild(editBtn);
    }
  });

  observer.observe(wrapper, { childList: true, subtree: true });

  return wrapper;
}

async function renderAdminEvents() {
  const container = document.getElementById("adminEventList");
  if (!container) return;

  let events = [];
  let adminContent = {
    eventsHeading: "My Events",
    addNewEventBtn: "Add New Event",
    seeMoreBtn: "See more",
  };

  if (typeof DataService !== "undefined") {
    try {
      events = await DataService.getEvents();
      const pageData = await DataService.getPageContent("adminHome");
      adminContent = { ...adminContent, ...pageData };
    } catch (e) {
      console.warn("Admin: could not load data from db.json.", e);
    }
  }

  const upcoming = events.slice(0, MAX_ADMIN_EVENTS);

  upcoming.forEach((event) => {
    container.appendChild(createAdminEventCard(event));
  });

  const username = localStorage.getItem("username") || "Admin";
  const titleEl = document.getElementById("adminTitle");
  if (titleEl) {
    titleEl.textContent = `Hello ${username},`;
  }

  const eventsHeadingEl = document.getElementById("eventsHeading");
  if (eventsHeadingEl) {
    eventsHeadingEl.textContent = adminContent.eventsHeading;
  }

  const addNewEventBtn = document.getElementById("addNewEventBtnContainer");
  if (addNewEventBtn) {
    addNewEventBtn.appendChild(
      createButton(
        "/src/pages/create-event/create-event.html",
        "outline",
        adminContent.addNewEventBtn,
      ),
    );
  }

  const seeMoreBtn = document.getElementById("seeMoreBtnContainer");
  if (seeMoreBtn) {
    seeMoreBtn.appendChild(
      createButton(
        "/src/pages/all-events/all-events.html",
        "outline",
        adminContent.seeMoreBtn,
      ),
    );
  }

  // Process the newly-added data-include elements (event cards, buttons).
  if (typeof window.loadIncludes === "function") {
    await window.loadIncludes();
  }
}

renderAdminEvents();
