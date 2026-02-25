function renderEventDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  if (!id || typeof eventsData === "undefined") return;

  const event = eventsData.find((e) => e.id === id);
  if (!event) return;

  const titleEl = document.querySelector(".event-detail__title");
  if (titleEl) titleEl.textContent = event.title;
  document.title = `${event.title} - Erasmus Las Palmas`;

  const descEl = document.querySelector(".event-detail__description");
  if (descEl) descEl.innerHTML = `<p>${event.description}</p>`;

  const tagEl = document.querySelector(".category-tag");
  if (tagEl) {
    tagEl.textContent = event.category;
    tagEl.classList.add(`category-tag--${event.category}`);
  }

  const metaItems = document.querySelectorAll(".event-detail__meta-item");
  const metaValues = [
    event.dateFormatted,
    event.time,
    event.location,
    event.organizer,
  ];

  metaItems.forEach((item, i) => {
    const label = item.querySelector(".event-detail__meta-label");
    if (label && metaValues[i]) {
      label.textContent = metaValues[i];
    }
  });

  const registerButton = document.querySelector(".btn");
  if (registerButton && event.registrationUrl) {
    registerButton.href = event.registrationUrl;
  }
}

renderEventDetail();
