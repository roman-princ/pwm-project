function loadEventData() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  if (!id || typeof eventsData === "undefined") return null;

  const event = eventsData.find((e) => e.id === id);
  return event;
}

function populateForm() {
  const event = loadEventData();
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

const form = document.getElementById("editEventForm");

if (form) {
  form.addEventListener("submit", (e) => {
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

    console.log("Event updated:", eventId, updatedData);

    alert("Event updated successfully!");

    window.location.href = `/src/pages/event-detail/event-detail.html?id=${eventId}`;
  });
}

const deleteBtn = document.getElementById("deleteBtn");

if (deleteBtn) {
  deleteBtn.addEventListener("click", () => {
    const params = new URLSearchParams(window.location.search);
    const eventId = Number(params.get("id"));

    if (
      confirm(
        "Are you sure you want to delete this event? This action cannot be undone.",
      )
    ) {
      console.log("Event deleted:", eventId);

      alert("Event deleted successfully!");

      window.location.href = "/src/pages/all-events/all-events.html";
    }
  });
}

populateForm();

const backBtnContainer = document.getElementById("backBtn");
if (backBtnContainer) backBtnContainer.appendChild(createBackButton(32, 2.5));

setPageContent({
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
  saveBtn: "Save Changes",
  deleteBtn: "Delete",
});

const registrationUrlInput = document.getElementById("registrationUrl");
if (registrationUrlInput)
  registrationUrlInput.placeholder = "https://example.com/register";
