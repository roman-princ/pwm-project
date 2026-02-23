/**
 * events-interaction.js
 * Handles UI logic for the All Events page.
 */

const initEventsPage = () => {
    const categoryContainer = document.querySelector('#categoryFilters');
    const viewSwitcher = document.querySelector('.view-switcher');
    const listView = document.getElementById('listView');
    const calendarView = document.getElementById('calendarView');

    // --- 1. Category Multiselect Logic ---
    if (categoryContainer) {
        categoryContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.tag');
            if (!btn) return;

            const allTags = categoryContainer.querySelectorAll('.tag');
            const isAllEventsBtn = btn.textContent.trim() === 'All Events';

            if (isAllEventsBtn) {
                // Reset: Select "All Events" and deselect everything else
                allTags.forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
            } else {
                // Toggle the clicked category
                btn.classList.toggle('active');
                // Deselect the "All Events" button since a specific filter is active
                allTags[0].classList.remove('active');

                // If no categories are left selected, default back to "All Events"
                const anyActive = Array.from(allTags).some(t => t.classList.contains('active'));
                if (!anyActive) allTags[0].classList.add('active');
            }

            console.log("Active Filters:", Array.from(allTags)
                .filter(t => t.classList.contains('active'))
                .map(t => t.textContent.trim()));
        });
    }

    // --- 2. View Switcher Toggle (List vs Calendar) ---
    if (viewSwitcher) {
        viewSwitcher.addEventListener('click', (e) => {
            const btn = e.target.closest('.view-btn');
            if (!btn) return;

            // Update Button UI
            viewSwitcher.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Logic to swap the containers
            const isCalendar = btn.textContent.includes('Calendar');

            if (isCalendar) {
                listView.style.display = 'none';
                calendarView.style.display = 'block';
            } else {
                listView.style.display = 'block';
                calendarView.style.display = 'none';
            }
        });
    }
};

/**
 * RE-INITIALIZATION LOGIC
 * Since referencer.js injects HTML after the page loads, we use a 
 * MutationObserver to detect when the components are added to the DOM.
 */
const observer = new MutationObserver((mutations, obs) => {
    const filtersLoaded = document.querySelector('#categoryFilters');
    if (filtersLoaded) {
        initEventsPage();
        obs.disconnect(); // Stop watching once initialized
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});