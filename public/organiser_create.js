document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('eventForm');
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('eventName').value;
        const address = document.getElementById('eventLocation').value;
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const artist = document.getElementById('eventArtist').value;
        const age_requirement = document.getElementById('eventAge').value;
        const theme = document.getElementById('eventTheme').value;
        const nr_of_tickets = parseInt(document.getElementById('eventTickets').value);

        console.log("Form values:", { name, address, date, time, artist, age_requirement, theme, nr_of_tickets });

        // Validation
        if (!name || !address || !date || !time || !artist || !age_requirement || !theme || !nr_of_tickets) {
            showNotification("Please fill in all fields.", 'error');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showNotification("You are not logged in.", 'error');
            return;
        }

        try {
            const res = await fetch('/create-event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    name,
                    address,
                    date,
                    time,
                    artist,
                    age_requirement,
                    theme,
                    nr_of_tickets
                })
            });

            const data = await res.json();
            if (data.success) {
                showNotification("Event submitted!");
                setTimeout(() => window.location.href = 'organiser_myevents.html', 1000);
            } else {
                showNotification('Submission failed: ' + (data.message || 'Unknown error'), 'error');
            }
        } catch (err) {
            console.error("Submit error:", err);
            showNotification("Error submitting event", 'error');
        }
    });

    function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.remove('hidden');
        setTimeout(() => notification.classList.add('hidden'), 3000);
    }
});


function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    setTimeout(() => notification.classList.add('hidden'), 3000);
}

