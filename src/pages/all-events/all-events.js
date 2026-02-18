document.addEventListener("DOMContentLoaded", () => {
    // 1. Multiselect Category Tags
    const categoryContainer = document.querySelector('#categoryFilters');

    if (categoryContainer) {
        categoryContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.tag');
            if (!btn) return;

            const allTags = categoryContainer.querySelectorAll('.tag');
            const isAllEventsBtn = btn.textContent.trim() === 'All Events';

            if (isAllEventsBtn) {
                // If "All Events" is clicked, reset others
                allTags.forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
            } else {
                // Toggle current tag
                btn.classList.toggle('active');
                // Deselect "All Events" if a specific category is picked
                allTags[0].classList.remove('active');

                // If nothing is selected, default back to "All Events"
                const anyActive = Array.from(allTags).some(t => t.classList.contains('active'));
                if (!anyActive) allTags[0].classList.add('active');
            }

            console.log("Selected categories:", getSelectedCategories());
        });
    }

    // 2. View Switcher (List vs Calendar - Exclusive)
    const viewSwitcher = document.querySelector('.view-switcher');

    if (viewSwitcher) {
        viewSwitcher.addEventListener('click', (e) => {
            const btn = e.target.closest('.view-btn');
            if (!btn) return;

            // Remove active from all and add to clicked
            viewSwitcher.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const viewType = btn.textContent.includes('List') ? 'list' : 'calendar';
            toggleView(viewType);
        });
    }

    // Helper functions
    function getSelectedCategories() {
        return Array.from(document.querySelectorAll('.tag.active'))
            .map(t => t.textContent.trim());
    }

    function toggleView(type) {
        console.log(`Switching to ${type} view`);
        // Here you would hide/show your list or calendar container
    }
});