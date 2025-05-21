const sidebar = document.getElementById('sidebar');
            let hoverTimer;

            // Add hover behavior
            sidebar.addEventListener('mouseenter', () => {
                hoverTimer = setTimeout(() => {
                    sidebar.classList.add('expanded');
                }, 100); // 100ms delay for smoother UX
            });

            sidebar.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimer);
                sidebar.classList.remove('expanded');
            });
            async function loadEvents() {
                try {
                    const res = await fetch('/events');
                    const events = await res.json();

                    const container = document.getElementById('eventsContainer');
                    container.innerHTML = '';

                    events.forEach(event => {
                        const card = document.createElement('div');
                        card.classList.add('event-card');

                        // Format date and time
                        const eventDate = new Date(event.date);
                        const formattedDate = eventDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });

                        const rawTime = event.time;
                        const timeParts = rawTime.split('T')[1].split(':');  // ["09", "00", "00.000Z"]
                        const formattedTime = `${timeParts[0]}:${timeParts[1]}`;

                        card.innerHTML = `
<!--                            <div class="event-image" style="background-image: url('${event.picture_url || 'fallback.jpg'}');"></div>-->

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
                                <a href="#" class="btn">Get Tickets</a>
                            </div>
                        `;

                        container.appendChild(card);
                    });

                    attachTicketListeners(); // Reattach modal logic
                } catch (err) {
                    console.error('Error loading events:', err);
                }
            }

            function attachTicketListeners() {
                const ticketButtons = document.querySelectorAll('.event-card .btn');
                const ticketModal = document.getElementById('ticketModal');

                ticketButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const eventCard = btn.closest('.event-card');
                        const eventTitle = eventCard.querySelector('h3').textContent;
                        const eventMeta = eventCard.querySelectorAll('.event-meta p');

                        document.getElementById('modalEventTitle').textContent = eventTitle;
                        document.getElementById('modalEventDate').textContent = eventMeta[1].textContent;
                        document.getElementById('modalEventLocation').textContent = eventMeta[0].textContent;
                        document.getElementById('modalAgeRequirement').textContent = eventMeta[2].textContent;
                        document.getElementById('modalArtists').textContent = eventMeta[3].textContent;
                        document.getElementById('modalTheme').textContent = eventMeta[4].textContent;

                        ticketModal.style.display = 'flex';
                    });
                });
            }

            function extractTime(isoTime) {
                try {
                    const dateObj = new Date(isoTime);
                    return dateObj.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                } catch {
                    return '00:00';
                }
            }

            function formatDateTime(date, time) {
                try {
                    if (!date) return 'Date TBD';
                    const dateObj = new Date(date);
                    if (time) {
                        const [hours, minutes] = time.split(':');
                        dateObj.setHours(+hours);
                        dateObj.setMinutes(+minutes);
                    }

                    return dateObj.toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });
                } catch {
                    return 'Invalid date';
                }
            }
            window.addEventListener('DOMContentLoaded', loadEvents);
    