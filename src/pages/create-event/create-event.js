function initCreateEventForm() {
  const backBtnContainer = document.getElementById("backBtn");
  if (backBtnContainer) backBtnContainer.appendChild(createBackButton(32, 2.5));

  setPageContent({
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
  });

  createCategoryOptions("category", "Select a category");

  const actionsContainer = document.getElementById("eventFormActions");
  if (actionsContainer) {
    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "btn btn--primary";
    submitBtn.id = "submitBtn";
    submitBtn.textContent = "Add";
    actionsContainer.appendChild(submitBtn);
  }

  const registrationUrlInput = document.getElementById("registrationUrl");
  if (registrationUrlInput)
    registrationUrlInput.placeholder = "https://example.com/register";

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
    form.addEventListener("submit", (e) => {
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
      };

      const dateObj = new Date(eventData.date);
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      eventData.dateFormatted = dateObj.toLocaleDateString("en-US", options);

      console.log("Event created:", eventData);

      alert("Event created successfully!");

      form.reset();
      imagePreview.innerHTML = "";
      window.location.href = "/src/pages/all-events/all-events.html";
    });
  }
}

// Wait for the event-form component to be loaded by referencer.js
const createFormObserver = new MutationObserver(() => {
  if (document.getElementById("eventForm")) {
    createFormObserver.disconnect();
    initCreateEventForm();
  }
});
createFormObserver.observe(document.body, { childList: true, subtree: true });
