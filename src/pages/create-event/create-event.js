async function initCreateEventForm() {
  const backBtnContainer = document.getElementById("backBtn");
  if (backBtnContainer) backBtnContainer.appendChild(createBackButton(32, 2.5));

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
      console.warn(
        "CreateEvent: could not load content from db.json, using defaults.",
        e,
      );
    }
  }

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

  createCategoryOptions("category", pageContent.categoryDefault);

  const actionsContainer = document.getElementById("eventFormActions");
  if (actionsContainer) {
    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "btn btn--primary";
    submitBtn.id = "submitBtn";
    submitBtn.textContent = pageContent.submitBtn;
    actionsContainer.appendChild(submitBtn);
  }

  const registrationUrlInput = document.getElementById("registrationUrl");
  if (registrationUrlInput)
    registrationUrlInput.placeholder = pageContent.registrationUrlPlaceholder;

  if (typeof window.loadIncludes === "function") {
    await window.loadIncludes();
  }

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

  const form = document.getElementById("eventForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

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

      if (typeof DataService !== "undefined") {
        try {
          const created = await DataService.createEvent(eventData);
          console.log("Event created:", created);
          alert("Event created successfully!");
          form.reset();
          if (imagePreview) imagePreview.innerHTML = "";
          window.location.href = "/src/pages/all-events/all-events.html";
        } catch (err) {
          console.error("Create event error:", err);
          alert("Failed to create event.");
        }
      } else {
        console.log("Event created:", eventData);
        alert("Event created successfully!");
        form.reset();
        if (imagePreview) imagePreview.innerHTML = "";
        window.location.href = "/src/pages/all-events/all-events.html";
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
