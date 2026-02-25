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

const form = document.getElementById("createEventForm");

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
