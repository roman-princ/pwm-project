async function initCreateEventForm() {
  const form = document.getElementById("eventForm");
  const backBtnContainer = document.getElementById("backBtn");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const imageInput = document.getElementById("image");
  const imagePreview = document.getElementById("imagePreview");

  if (backBtnContainer && typeof createBackButton === "function") {
    backBtnContainer.appendChild(createBackButton(32, 2.5));
  }

  // handle content
  let pageContent = {
    pageHeading: "Create New Event",
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
    categoryDefault: "Select a category",
    registrationUrlPlaceholder: "https://example.com/register",
    submitBtn: "Add",
  };

  if (typeof DataService !== "undefined") {
    try {
      const data = await DataService.getPageContent("createEvent");
      pageContent = { ...pageContent, ...data };
    } catch (e) {
      console.warn("Using default content due to fetch error.", e);
    }
  }

  // buttons
  const submitBtn = document.getElementById("submitBtn");
  const deleteBtn = document.getElementById("deleteBtn");

  if (submitBtn) {
    submitBtn.textContent = pageContent.submitBtn || "Add Event";
  }

  if (deleteBtn) {
    deleteBtn.style.display = "none"; // ensure delete is hidden
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

  if (typeof createCategoryOptions === "function") {
    createCategoryOptions("category", pageContent.categoryDefault);
  }

  // submit button
  const actionsContainer = document.getElementById("eventFormActions");
  if (actionsContainer && !document.getElementById("submitBtn")) {
    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "btn btn--primary";
    submitBtn.id = "submitBtn";
    submitBtn.textContent = pageContent.submitBtn;
    actionsContainer.appendChild(submitBtn);
  }

  const registrationUrlInput = document.getElementById("registrationUrl");
  if (registrationUrlInput) {
    registrationUrlInput.placeholder = pageContent.registrationUrlPlaceholder;
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
      const formData = new FormData(form);
      const eventData = {
        title: formData.get("title"),
        category: formData.get("category"),
        organizer: formData.get("organizer"),
        description: formData.get("description"),
        date: formData.get("date"),
        time: formData.get("time"),
        location: formData.get("location"),
        registrationUrl: formData.get("registrationUrl"),
        image: null,
        createdBy: Number(localStorage.getItem("userId")) || 1,
      };

      try {
        if (typeof DataService !== "undefined") {
          const created = await DataService.createEvent(eventData);
          console.log("Event created:", created);
        } else {
          console.log("Mockup data saved:", eventData);
        }

        alert("Event created successfully!");
        form.reset();
        if (imagePreview) imagePreview.innerHTML = "";

        window.location.href = "/src/pages/all-events/all-events.html";

      } catch (err) {
        console.error("Create event error:", err);
        alert("Failed to create event. Please check your connection.");
      }
    });
  }
}

const createFormObserver = new MutationObserver(() => {
  if (document.getElementById("eventForm")) {
    createFormObserver.disconnect();
    initCreateEventForm();
  }
});
createFormObserver.observe(document.body, { childList: true, subtree: true });