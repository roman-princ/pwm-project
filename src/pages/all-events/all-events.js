(async function initAllEventsPage() {
    let allEventsContent = {
        pageTitle: "All Events",
        filterLabel: "Filter by category",
    };

    let allEvents = [];

    // multiselect
    let activeFilters = new Set(["all events"]);

    if (typeof DataService !== "undefined") {
        try {
            const data = await DataService.getPageContent("allEvents");
            allEventsContent = { ...allEventsContent, ...data };
        } catch (e) {
            console.warn("AllEvents: could not load content from db.json, using defaults.", e);
        }
    }

    setPageContent(allEventsContent);
    createFilterTags("categoryFilters", allEventsContent.pageTitle);

    if (typeof DataService !== "undefined") {
        try {
            allEvents = await DataService.getEvents();
        } catch (e) {
            console.warn("AllEvents: could not load events from db.json.", e);
        }
    }

    const container = document.getElementById("eventsContainer");
    if (container && allEvents.length) renderEventCards(allEvents, container);

    // filtering
    const filterContainer = document.getElementById("categoryFilters");

    if (filterContainer) {
        filterContainer.addEventListener("click", (e) => {
            const clickedBtn = e.target.closest("button");
            if (!clickedBtn) return;

            const selectedCategory = clickedBtn.textContent.trim().toLowerCase();

            // active filters
            if (selectedCategory === "all events") {
                // all events
                activeFilters.clear();
                activeFilters.add("all events");
            } else {
                activeFilters.delete("all events");

                // toggle category
                if (activeFilters.has(selectedCategory)) {
                    activeFilters.delete(selectedCategory);
                } else {
                    activeFilters.add(selectedCategory);
                }

                // reset to all events
                if (activeFilters.size === 0) {
                    activeFilters.add("all events");
                }
            }

            const allBtns = filterContainer.querySelectorAll("button");
            allBtns.forEach(btn => {
                const btnCategory = btn.textContent.trim().toLowerCase();

                if (activeFilters.has(btnCategory)) {
                    btn.classList.add("active", "bg-gray-800", "text-white");
                } else {
                    btn.classList.remove("active", "bg-gray-800", "text-white");
                }
            });

            // filter data
            let filteredEvents;
            if (activeFilters.has("all events")) {
                filteredEvents = allEvents;
            } else {
                filteredEvents = allEvents.filter(event => activeFilters.has(event.category.toLowerCase()));
            }

            // re-render ui
            if (container) {
                container.innerHTML = "";
                if (filteredEvents.length > 0) {
                    renderEventCards(filteredEvents, container);
                } else {
                    container.innerHTML = "<p class='text-gray-500 mt-4'>No events found for the selected categories.</p>";
                }
            }
        });
    }

    const seeMoreBtn = document.getElementById("seeMoreBtnContainer");
    if (seeMoreBtn) seeMoreBtn.appendChild(createButton("#", "outline", "See more"));

    if (typeof window.loadIncludes === "function") {
        await window.loadIncludes();
    }
})();


document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("eventsContainer");
    const filterContainer = document.getElementById("categoryFilters");
    let allEvents = [];

    // load content
    if (typeof DataService !== "undefined") {
        try {
            const pageData = await DataService.getPageContent("allEvents");
            // defaults
            const content = {
                pageTitle: "All Events",
                filterLabel: "Filter by category",
                ...pageData,
            };

            setPageContent(content);
            createFilterTags("categoryFilters", content.pageTitle);
        } catch (e) {
            console.warn("AllEvents: could not load page content.", e);
        }

        // render initial events
        try {
            allEvents = await DataService.getEvents();
            if (container && allEvents.length) {
                renderEventCards(allEvents, container);
            }
        } catch (e) {
            console.warn("AllEvents: could not load events.", e);
        }
    }

    // filtering
    if (filterContainer) {
        filterContainer.addEventListener("click", (e) => {
            const btn = e.target.closest(".filter-tag");
            if (!btn) return;

            const allTags = filterContainer.querySelectorAll(".filter-tag");
            const isAllEventsBtn = btn.textContent.trim().toLowerCase() === "all events";

            // toggle classes
            if (isAllEventsBtn) {
                allTags.forEach((t) => t.classList.remove("filter-tag--active"));
                btn.classList.add("filter-tag--active");
            } else {
                btn.classList.toggle("filter-tag--active");
                allTags[0].classList.remove("filter-tag--active");

                // reset to all-events as default
                const anyActive = Array.from(allTags).some((t) => t.classList.contains("filter-tag--active"));
                if (!anyActive) allTags[0].classList.add("filter-tag--active");
            }

            // active tags
            const activeFilters = Array.from(allTags)
                .filter((t) => t.classList.contains("filter-tag--active"))
                .map((t) => t.textContent.trim().toLowerCase());

            // filter events
            let filteredEvents;
            if (activeFilters.includes("all events")) {
                filteredEvents = allEvents;
            } else {
                filteredEvents = allEvents.filter((event) =>
                    activeFilters.includes(event.category.toLowerCase())
                );
            }

            // render ui
            if (container) {
                if (filteredEvents.length > 0) {
                    renderEventCards(filteredEvents, container);
                } else {
                    // fallback message
                    container.innerHTML = "<p class='events-empty-msg' style='margin-top: 1rem; color: #666;'>No events found for the selected categories.</p>";
                }
            }
        });
    }
});