async function loadEventData() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  if (!id) return null;

  if (typeof DataService !== "undefined") {
    try {
      return await DataService.getEventById(id);
    } catch (e) {
      console.warn("EditEvent: could not load event from db.json.", e);
      return null;
    }
  }
  return null;
}

async function populateForm() {
  const event = await loadEventData();
  if (!event) {
    alert("Event not found!");
    window.location.href = "/src/pages/all-events/all-events.html";
    return;
  }

  createCategoryOptions("category", "Select a category");

  document.getElementById("title").value = event.title;
  document.getElementById("category").value = event.category;
  document.getElementById("organizer").value = event.organizer;
  document.getElementById("description").value = event.description;
  document.getElementById("date").value = event.date;
  document.getElementById("time").value = event.time;
  document.getElementById("location").value = event.location;
  document.getElementById("registrationUrl").value =
    event.registrationUrl || "#";
}

async function initEditEventForm() {
  const imageInput = document.getElementById("image");
  const imagePreview = document.getElementById("imagePreview");

  if (imageInput) {
    imageInput.addEventListener("change", (e) => {
      imagePreview.innerHTML = "";
      const files = Array.from(e.target.files);

      files.forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = document.createElement("img");
            img.src = event.target.result;
            imagePreview.appendChild(img);
          };
          reader.readAsDataURL(file);
        }
      });
    });
  }

  // Load page content from db.json
  let pageContent = {
    pageHeading: "Edit Event",
    titleLabel: "Title:",
    categoryLabel: "Category:",
    organizerLabel: "Organizer:",
    descriptionLabel: "Description:",
    dateLabel: "Date:",
    timeLabel: "Time:",
    locationLabel: "Location:",
    registrationUrlLabel: "Registration URL:",
    imageLabel: "Pictures:",
    fileUploadText: "Click to upload images",
    registrationUrlPlaceholder: "https://example.com/register",
    saveBtn: "Save Changes",
    deleteBtn: "Delete",
  };

  if (typeof DataService !== "undefined") {
    try {
      const data = await DataService.getPageContent("editEvent");
      pageContent = { ...pageContent, ...data };
    } catch (e) {
      console.warn(
        "EditEvent: could not load content from db.json, using defaults.",
        e,
      );
    }
  }

  const actionsContainer = document.getElementById("eventFormActions");
  if (actionsContainer) {
    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn btn--edit";
    saveBtn.id = "saveBtn";
    saveBtn.textContent = pageContent.saveBtn;
    actionsContainer.appendChild(saveBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn--danger";
    deleteBtn.id = "deleteBtn";
    deleteBtn.textContent = pageContent.deleteBtn;
    actionsContainer.appendChild(deleteBtn);
  }

  const form = document.getElementById("eventForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const params = new URLSearchParams(window.location.search);
      const eventId = Number(params.get("id"));

      const formData = new FormData(form);
      const updatedData = {
        title: formData.get("title"),
        category: formData.get("category"),
        organizer: formData.get("organizer"),
        description: formData.get("description"),
        date: formData.get("date"),
        time: formData.get("time"),
        location: formData.get("location"),
        registrationUrl: formData.get("registrationUrl"),
      };

      if (typeof DataService !== "undefined") {
        try {
          await DataService.updateEvent(eventId, updatedData);
          console.log("Event updated:", eventId, updatedData);
          alert("Event updated successfully!");
          window.location.href = `/src/pages/event-detail/event-detail.html?id=${eventId}`;
        } catch (err) {
          console.error("Update event error:", err);
          alert("Failed to update event.");
        }
      } else {
        console.log("Event updated:", eventId, updatedData);
        alert("Event updated successfully!");
        window.location.href = `/src/pages/event-detail/event-detail.html?id=${eventId}`;
      }
    });
  }

  const deleteBtnEl = document.getElementById("deleteBtn");

  if (deleteBtnEl) {
    deleteBtnEl.addEventListener("click", async () => {
      const params = new URLSearchParams(window.location.search);
      const eventId = Number(params.get("id"));

      if (
        confirm(
          "Are you sure you want to delete this event? This action cannot be undone.",
        )
      ) {
        if (typeof DataService !== "undefined") {
          try {
            await DataService.deleteEvent(eventId);
            console.log("Event deleted:", eventId);
            alert("Event deleted successfully!");
            window.location.href = "/src/pages/all-events/all-events.html";
          } catch (err) {
            console.error("Delete event error:", err);
            alert("Failed to delete event.");
          }
        } else {
          console.log("Event deleted:", eventId);
          alert("Event deleted successfully!");
          window.location.href = "/src/pages/all-events/all-events.html";
        }
      }
    });
  }

  await populateForm();

  const backBtnContainer = document.getElementById("backBtn");
  if (backBtnContainer) backBtnContainer.appendChild(createBackButton(32, 2.5));

  setPageContent({
    pageHeading: pageContent.pageHeading,
    titleLabel: pageContent.titleLabel,
    categoryLabel: pageContent.categoryLabel,
    organizerLabel: pageContent.organizerLabel,
    descriptionLabel: pageContent.descriptionLabel,
    dateLabel: pageContent.dateLabel,
    timeLabel: pageContent.timeLabel,
    locationLabel: pageContent.locationLabel,
    registrationUrlLabel: pageContent.registrationUrlLabel,
    imageLabel: pageContent.imageLabel,
    fileUploadText: pageContent.fileUploadText,
  });

  const registrationUrlInput = document.getElementById("registrationUrl");
  if (registrationUrlInput)
    registrationUrlInput.placeholder = pageContent.registrationUrlPlaceholder;

  // Process the newly-added data-include elements (back button).
  if (typeof window.loadIncludes === "function") {
    await window.loadIncludes();
  }
}

// Wait for the event-form component to be loaded by referencer.js
const editFormObserver = new MutationObserver(() => {
  if (document.getElementById("eventForm")) {
    editFormObserver.disconnect();
    initEditEventForm();
  }
});
editFormObserver.observe(document.body, { childList: true, subtree: true });
