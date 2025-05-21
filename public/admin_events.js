function handleColumnSearch(containerId, searchId) {
    const searchTerm = document.getElementById(searchId).value.trim().toLowerCase();
    const events = document.querySelectorAll(`#${containerId} .admin-card`);
    let foundMatch = false;

    events.forEach(event => {
        const eventName = event.querySelector('strong').textContent.toLowerCase();
        if (eventName.includes(searchTerm)) {
            event.style.display = 'block';
            foundMatch = true;
            if (!event.classList.contains('highlight')) {
                event.classList.add('highlight');
                setTimeout(() => event.classList.remove('highlight'), 1500);
            }
        } else {
            event.style.display = 'none';
        }
    });

    if (!foundMatch && searchTerm !== '') {
        alert(`No events found matching "${searchTerm}"`);
    }
}

function handleActiveSearch() {
    handleColumnSearch('activeEventsContainer', 'activeSearch');
}

function handlePendingSearch() {
    handleColumnSearch('pendingEventsContainer', 'pendingSearch');
}

async function loadEventsForAdmin() {
    try {
        const token = localStorage.getItem('token');
        console.log('Token:', token);
        const res = await fetch('/admin-events', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
});
        console.log('res', res)
        const events = await res.json();

        const activeContainer = document.getElementById('activeEventsContainer');
        const pendingContainer = document.getElementById('pendingEventsContainer');
        const activeCountElem = document.getElementById('activeCount');
        const pendingCountElem = document.getElementById('pendingCount');

        // Reset containers
        activeContainer.innerHTML = '';
        pendingContainer.innerHTML = '';

        let activeCount = 0;
        let pendingCount = 0;



        events.forEach(event => {
        const card = document.createElement('div');
        card.classList.add('admin-card');
        if (event.status.toLowerCase() === 'pending') {
            card.classList.add('pending');
            pendingCount++;
        } else if (event.status.toLowerCase() === 'active') {
            activeCount++;
        }

            card.innerHTML = `
                    <div class="event-meta">
                        <p><strong>${event.name}</strong></p>
                        <p><i class="fas fa-map-marker-alt"></i> ${event.address}</p>
                        <p><i class="fas fa-calendar-alt"></i> ${new Date(event.date).toLocaleDateString()}</p>
                        <p><i class="fas fa-ticket-alt"></i> Available: ${event.nr_of_tickets}</p>
                        
                    </div>
                    <div class="admin-actions">
                        ${event.status === 'pending' ? `
                            <button class="btn btn-success" onclick="updateStatus('${event.name}', 'active')"><i class="fas fa-check"></i> Approve</button>
                            <button class="btn btn-danger" onclick="deleteEvent('${event.name}')"><i class="fas fa-times"></i> Reject</button>
                        ` : `
                            <button class="btn btn-danger" onclick="deleteEvent(${event.EventID})"><i class="fas fa-trash"></i> Delete</button>
                        `}
                    </div>
                `;

            if (event.status.toLowerCase() === 'pending') {
                pendingContainer.appendChild(card);
            } else {
                activeContainer.appendChild(card);
            }
        });
        // Update counts
        activeCountElem.textContent = activeCount;
        pendingCountElem.textContent = pendingCount;
    } catch (err) {
        console.error('Failed to load events:', err);
    }
    setTimeout(() => {
        if (typeof runTests === "function") runTests();
    }, 0);
}

async function updateStatus(eventName, newStatus) {
    const token = localStorage.getItem('token');
    await fetch('/update-event-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ name: eventName, status: newStatus })
    });
    location.reload();
}

async function deleteEvent(eventId) {
    const token = localStorage.getItem('token');
    const res = await fetch('/delete-event', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ eventId })
    });
    const data = await res.json();
    if (data.success) {
        alert('Event deleted!');
        loadEventsForAdmin();
    }
}


window.addEventListener('DOMContentLoaded', loadEventsForAdmin);