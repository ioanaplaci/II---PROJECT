// Sidebar behavior
const sidebar = document.getElementById('sidebar');
let hoverTimer;
sidebar.addEventListener('mouseenter', () => {
    hoverTimer = setTimeout(() => sidebar.classList.add('expanded'), 100);
});
sidebar.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimer);
    sidebar.classList.remove('expanded');
});

// Load events
async function loadEvents() {
    try {
        const res = await fetch('/events');
        const events = await res.json();
        const container = document.getElementById('eventsContainer');
        container.innerHTML = '';

        events.forEach(event => {
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const rawTime = event.time.split('T')[1].split(':');
            const formattedTime = `${rawTime[0]}:${rawTime[1]}`;

            const card = document.createElement('div');
            card.classList.add('event-card');

            card.innerHTML = `
                <div class="event-details">
                    <h3>${event.name}</h3>
                    <div class="event-meta">
                        <p><i class="fas fa-map-marker-alt"></i> ${event.address}</p>
                        <p><i class="fas fa-calendar-day"></i> ${formattedDate} | ${formattedTime}</p>
                        <p><i class="fas fa-user-tag"></i> Age requirements: ${event.age_requirement}</p>
                        <p><i class="fas fa-users"></i> ${event.artist || 'TBA'}</p>
                        <p><i class="fas fa-palette"></i> Theme: ${event.theme || 'General'}</p>
                        <p><i class="fas fa-ticket-alt"></i> Tickets Available: ${event.nr_of_tickets}</p>
                    </div>
                    <a href="#" class="btn"
                       data-eventid="${event.id}"
                       data-eventname="${event.name}"
                       data-address="${event.address}"
                       data-date="${formattedDate} | ${formattedTime}"
                       data-age="${event.age_requirement}"
                       data-artists="${event.artist || 'TBA'}"
                       data-theme="${event.theme || 'General'}">Get Tickets</a>
                </div>
            `;
            container.appendChild(card);
        });

        attachTicketListeners();
    } catch (err) {
        console.error('Error loading events:', err);
    }
}

function attachTicketListeners() {
    const ticketModal = document.getElementById('ticketModal');
    const buttons = document.querySelectorAll('.event-card .btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('modalEventTitle').textContent = btn.dataset.eventname;
            document.getElementById('modalEventDate').textContent = btn.dataset.date;
            document.getElementById('modalEventLocation').textContent = btn.dataset.address;
            document.getElementById('modalAgeRequirement').textContent = `Age requirements: ${btn.dataset.age}`;
            document.getElementById('modalArtists').textContent = `Artists: ${btn.dataset.artists}`;
            document.getElementById('modalTheme').textContent = `Theme: ${btn.dataset.theme}`;
            ticketModal.dataset.eventname = btn.dataset.eventname;
            ticketModal.style.display = 'flex';
        });
    });
}

// Modal close behavior
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('ticketModal').style.display = 'none';
});
window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('ticketModal')) {
        e.target.style.display = 'none';
    }
});

// Quantity input and total update
document.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const input = this.parentNode.querySelector('.quantity-input');
        let value = parseInt(input.value);
        value = this.classList.contains('plus') ? Math.min(value + 1, 10) : Math.max(value - 1, 0);
        input.value = value;
        updateTotals();
    });
});
document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', updateTotals);
});
function updateTotals() {
    const prices = [49.99, 79.99];
    let subtotal = 0;
    document.querySelectorAll('.quantity-input').forEach((input, i) => {
        subtotal += parseInt(input.value) * prices[i];
    });
    const fee = subtotal * 0.1;
    document.querySelector('.subtotal .amount').textContent = subtotal.toFixed(2) + ' RON';
    document.querySelector('.fees .amount').textContent = fee.toFixed(2) + ' RON';
    document.querySelector('.total .amount').textContent = (subtotal + fee).toFixed(2) + ' RON';
}
updateTotals();

// Checkout: Save to DB
document.querySelector('.checkout-btn').addEventListener('click', async () => {
    const generalQty = parseInt(document.querySelectorAll('.quantity-input')[0].value);
    const vipQty = parseInt(document.querySelectorAll('.quantity-input')[1].value);

    if (generalQty + vipQty === 0) {
        alert("Please select at least one ticket.");
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        showNotification("Login required to book tickets.");
        return;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const email = payload.email;

    const eventName = document.getElementById('ticketModal').dataset.eventname;

    const tickets = [];

    if (generalQty > 0) {
        tickets.push({ ticketType: 'General', EventName: eventName, ClientEmail: email, NrOfTickets: generalQty });
    }
    if (vipQty > 0) {
        tickets.push({ ticketType: 'VIP', EventName: eventName, ClientEmail: email, NrOfTickets: vipQty });
    }

    try {
        const res = await fetch('/book-tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ tickets })
        });

        const data = await res.json();
        if (data.success) {
            showNotification("Ticket(s) purchased successfully!", 'success');
            document.getElementById('ticketModal').style.display = 'none';
        } else {
            showNotification("Booking failed: " + (data.message || "Unknown error."), 'error');
        }
    } catch (err) {
        console.error(err);
        showNotification("Unexpected error while booking.");
    }

});

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000); // hides after 3 sec
}

// Load events on page load
window.addEventListener('DOMContentLoaded', loadEvents);


