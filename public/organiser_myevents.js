document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    let allEvents = []; // Store events for search functionality

    // Fetch events from server
    const fetchOrganiserEvents = async () => {
        try {
            const response = await fetch('/organiser-events', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Failed to load events. Please try again.');
            return [];
        }
    };

    // Display events in appropriate columns
    const displayEvents = (events) => {
        const activeContainer = document.getElementById('activeEventsContainer');
        const pendingContainer = document.getElementById('pendingEventsContainer');
        activeContainer.innerHTML = '';
        pendingContainer.innerHTML = '';

        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'organiser-card';
            

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

            //console.log("Formatted Date: ", formattedDate);
            //console.log("Formatted Time: ",formattedTime);

            card.innerHTML = `
                <div class="event-info">
                    <h3>${event.name}</h3>
                    <p><i class="fas fa-calendar-day"></i> ${formattedDate} | ${formattedTime}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${event.address}</p>
                    <p><i class="fas fa-ticket-alt"></i> Tickets Available: ${event.nr_of_tickets}</p>
                </div>
            `;

            // Add to appropriate column
            if (event.status.toLowerCase() === 'pending') {
                pendingContainer.appendChild(card);
            } else {
                activeContainer.appendChild(card);
            }
        });
    };

    // Search functionality (click-based)
    const setupSearch = () => {
        const performSearch = (containerId, searchId) => {
            const searchTerm = document.getElementById(searchId).value.toLowerCase().trim();
            const container = document.getElementById(containerId);
            const cards = container.querySelectorAll('.organiser-card');
            let foundMatch = false;

            cards.forEach(card => {
                const match = card.querySelector('h3').textContent.toLowerCase().includes(searchTerm);
                card.style.display = match ? 'block' : 'none';
                if (match) foundMatch = true;
            });

            if (!foundMatch && searchTerm !== '') {
                alert(`No events found matching "${searchTerm}"`);
            }
        };

        // Add click handlers to search buttons
        document.querySelectorAll('.search-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const searchBar = e.currentTarget.previousElementSibling;
                const isActive = searchBar.id === 'activeSearch';
                performSearch(
                    isActive ? 'activeEventsContainer' : 'pendingEventsContainer',
                    searchBar.id
                );
            });
        });
    };

    // Initial setup
    try {
        allEvents = await fetchOrganiserEvents();
        displayEvents(allEvents);
        setupSearch();
    } catch (error) {
        console.error('Initialization error:', error);
    }
});


// Example Express route
app.get('/organiser-events', authMiddleware, async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user.id });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

