// Load tickets on page load
window.addEventListener('DOMContentLoaded', loadTickets);

async function loadTickets() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch('/my-tickets', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await res.json();
        const container = document.querySelector('.tickets-container');
        container.innerHTML = '';

        data.forEach((ticket, index) => {
            const card = document.createElement('div');
            card.className = 'ticket-card';
            card.innerHTML = `
                <div class="ticket-details">
                    <h3>${ticket.EventName}</h3>
                    <p>🎫 Ticket #${ticket.TicketID || index + 1}</p>
                    <p>🎟️ ${ticket.ticketType} — ${ticket.NrOfTickets} ticket(s)</p>
                </div>
                <div class="ticket-actions">
                    <button class="btn view-btn">View</button>
                </div>
            `;
            container.appendChild(card);
        });

        attachTicketModals();
    } catch (err) {
        console.error('Error loading tickets:', err);
    }
}

// Modal Logic
function attachTicketModals() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const ticketModal = document.getElementById('ticketModal');

    viewButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const ticketCard = btn.closest('.ticket-card');
            const eventTitle = ticketCard.querySelector('h3').textContent;
            const ticketNumber = ticketCard.querySelectorAll('p')[0].textContent.replace('🎫 Ticket #', '').trim();
            const attendees = ticketCard.querySelectorAll('p')[1].textContent;

            document.getElementById('modalEventTitle').textContent = eventTitle;
            document.getElementById('modalTicketNumber').textContent = ticketNumber;
            document.getElementById('modalAttendees').textContent = attendees;

            document.getElementById('modalQRCode').src =
                `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Ticket${ticketNumber}`;

            ticketModal.style.display = 'flex';
        });
    });
}

// Close modal logic
const closeButtons = document.querySelectorAll('.close-modal');
closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
});