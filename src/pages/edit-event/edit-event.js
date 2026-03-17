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

  if (typeof createCategoryOptions === "function") {
    createCategoryOptions("category", "Select a category");
  }

  document.getElementById("title").value = event.title || "";
  document.getElementById("category").value = event.category || "";
  document.getElementById("organizer").value = event.organizer || "";
  document.getElementById("description").value = event.description || "";
  document.getElementById("date").value = event.date || "";
  document.getElementById("time").value = event.time || "";
  document.getElementById("location").value = event.location || "";
  document.getElementById("registrationUrl").value = event.registrationUrl || "";
}

async function initEditEventForm() {
  const form = document.getElementById("eventForm");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const imageInput = document.getElementById("image");
  const imagePreview = document.getElementById("imagePreview");
  const backBtnContainer = document.getElementById("backBtn");

  if (backBtnContainer && typeof createBackButton === "function") {
    backBtnContainer.appendChild(createBackButton(32, 2.5));
  }

  // buttons
  const submitBtn = document.getElementById("submitBtn");
  const deleteBtn = document.getElementById("deleteBtn");

  if (submitBtn) {
    submitBtn.textContent = pageContent.saveBtn || "Save Changes";
  }

  // if (deleteBtn) {
  //   deleteBtn.textContent = pageContent.deleteBtn || "Delete";
  //   deleteBtn.style.display = "block"; // show the delete button

  //   // delete logic
  //   deleteBtn.addEventListener("click", async () => {
  //     const params = new URLSearchParams(window.location.search);
  //     const eventId = Number(params.get("id"));

  //     if (confirm("Are you sure you want to delete this event?")) {
  //       try {
  //         if (typeof DataService !== "undefined") {
  //           await DataService.deleteEvent(eventId);
  //           alert("Event deleted successfully!");
  //           window.location.href = "/src/pages/all-events/all-events.html";
  //         }
  //       } catch (err) {
  //         alert("Failed to delete event.");
  //       }
  //     }
  //   });
  // }

  // handle content
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
      console.warn("EditEvent: using defaults.", e);
    }
  }

  // apply labels
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText("pageHeading", pageContent.pageHeading);
  setText("titleLabel", pageContent.titleLabel);
  setText("categoryLabel", pageContent.categoryLabel);
  setText("organizerLabel", pageContent.organizerLabel);
  setText("descriptionLabel", pageContent.descriptionLabel);
  setText("dateLabel", pageContent.dateLabel);
  setText("timeLabel", pageContent.timeLabel);
  setText("locationLabel", pageContent.locationLabel);
  setText("registrationUrlLabel", pageContent.registrationUrlLabel);
  setText("imageLabel", pageContent.imageLabel);
  setText("fileUploadText", pageContent.fileUploadText);

  // buttons
  const actionsContainer = document.getElementById("eventFormActions");
  if (actionsContainer && !document.getElementById("saveBtn")) {
    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn btn--primary"; // using your primary class
    saveBtn.id = "saveBtn";
    saveBtn.textContent = pageContent.saveBtn;
    actionsContainer.appendChild(saveBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn--danger";
    deleteBtn.id = "deleteBtn";
    deleteBtn.textContent = pageContent.deleteBtn;
    actionsContainer.appendChild(deleteBtn);

    deleteBtn.addEventListener("click", async () => {
      const params = new URLSearchParams(window.location.search);
      const eventId = Number(params.get("id"));
      if (confirm("Are you sure you want to delete this event?")) {
        try {
          if (typeof DataService !== "undefined") await DataService.deleteEvent(eventId);
          alert("Event deleted successfully!");
          window.location.href = "/src/pages/all-events/all-events.html";
        } catch (err) {
          alert("Failed to delete event.");
        }
      }
    });
  }

  // validation
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }

  const validateTime = () => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    if (dateInput.value === todayStr) {
      const currentTime = now.getHours().toString().padStart(2, '0') + ":" +
        now.getMinutes().toString().padStart(2, '0');
      if (timeInput.value && timeInput.value < currentTime) {
        timeInput.setCustomValidity("Time cannot be in the past for today.");
      } else {
        timeInput.setCustomValidity("");
      }
    } else {
      timeInput.setCustomValidity("");
    }
  };

  if (timeInput) timeInput.addEventListener("input", validateTime);
  if (dateInput) dateInput.addEventListener("change", validateTime);

  // image preview
  if (imageInput) {
    imageInput.addEventListener("change", (e) => {
      imagePreview.innerHTML = "";
      Array.from(e.target.files).forEach((file) => {
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

  // fill data
  await populateForm();

  if (typeof window.loadIncludes === "function") {
    await window.loadIncludes();
  }

  // submit handler
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // custom validation
      validateTime();

      // INVALID - show error messages
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        const firstInvalid = form.querySelector(":invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // VALID - prepare data
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
        // image: handled separately or updated if file exists
      };

      try {
        if (typeof DataService !== "undefined") {
          await DataService.updateEvent(eventId, updatedData);
        }
        alert("Changes saved successfully!");
        window.location.href = `/src/pages/event-detail/event-detail.html?id=${eventId}`;
      } catch (err) {
        alert("Failed to save changes.");
      }
    });
  }
}

const editFormObserver = new MutationObserver(() => {
  if (document.getElementById("eventForm")) {
    editFormObserver.disconnect();
    initEditEventForm();
  }
});
editFormObserver.observe(document.body, { childList: true, subtree: true });