const MAX_ADMIN_EVENTS = 4;

function createAdminEventCard(event) {
  const wrapper = document.createElement("div");
  wrapper.className = "admin-card-wrapper";
  wrapper.style.maxWidth = "900px";
  wrapper.style.width = "100%";

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

function renderAdminEvents() {
  const container = document.getElementById("adminEventList");
  if (!container || typeof eventsData === "undefined") return;

  const upcoming = eventsData.slice(0, MAX_ADMIN_EVENTS);

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
    eventsHeadingEl.textContent = "My Events";
  }

  const addNewEventBtn = document.getElementById("addNewEventBtnContainer");
  if (addNewEventBtn) {
    addNewEventBtn.appendChild(
      createButton(
        "/src/pages/create-event/create-event.html",
        "outline",
        "Add New Event",
      ),
    );
  }

  const seeMoreBtn = document.getElementById("seeMoreBtnContainer");
  if (seeMoreBtn) {
    seeMoreBtn.appendChild(
      createButton(
        "/src/pages/all-events/all-events.html",
        "outline",
        "See more",
      ),
    );
  }
}

renderAdminEvents();
