const events = [
    { id: 1, type: 'featured', name: 'Beach Clean-up', date: 'March 12', time: '10:00', place: 'Las Canteras' },
    { id: 2, type: 'wide', name: 'Tapas Night', date: 'March 14', time: '20:00', place: 'Vegueta' },
    { id: 3, type: 'small', name: 'Surfing Class', date: 'March 15', time: '09:00', place: 'La Cicer' },
    { id: 4, type: 'small', name: 'Hiking', date: 'March 16', time: '08:00', place: 'Roque Nublo' }
];

const grid = document.getElementById('eventGrid');

function renderEvents() {
    grid.innerHTML = events.map(event => `
        <div class="event-card ${event.type === 'featured' ? 'featured-card' : event.type === 'wide' ? 'wide-card' : ''}">
            <div class="card-img"></div>
            <div class="card-content">
                <h3>${event.name}</h3>
                <p>📅 ${event.date}</p>
                <p>🕒 ${event.time}</p>
                <p>📍 ${event.place}</p>
            </div>
        </div>
    `).join('');
}

renderEvents();