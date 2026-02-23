const events = [
    { id: 1, type: 'featured', name: 'Beach Clean-up', date: 'March 12', time: '10:00', place: 'Las Canteras' },
    { id: 2, type: 'wide', name: 'Tapas Night', date: 'March 14', time: '20:00', place: 'Vegueta' },
    { id: 3, type: 'small', name: 'Surfing Class', date: 'March 15', time: '09:00', place: 'La Cicer' },
    { id: 4, type: 'small', name: 'Hiking', date: 'March 16', time: '08:00', place: 'Roque Nublo' }
];

const grid = document.getElementById('eventGrid');

function renderEvents() {
    grid.innerHTML = events.map(event => {
        // Handle BEM Modifiers: block--modifier
        let modifier = '';
        if (event.type === 'featured') {
            modifier = 'event-card--featured';
        } else if (event.type === 'wide') {
            modifier = 'event-card--wide';
        }

        // Return BEM-compliant HTML: block__element
        return `
            <article class="event-card ${modifier}">
                <div class="event-card__img"></div>
                <div class="event-card__content">
                    <h3 class="event-card__title">${event.name}</h3>
                    <p class="event-card__info">📅 ${event.date}</p>
                    <p class="event-card__info">🕒 ${event.time}</p>
                    <p class="event-card__info">📍 ${event.place}</p>
                </div>
            </article>
        `;
    }).join('');
}

renderEvents();