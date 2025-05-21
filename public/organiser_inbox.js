document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('applicationsContainer');
    const token = localStorage.getItem('token');

    if (!token) {
        console.warn('No token found in localStorage');
        return;
    }

    try {
        const res = await fetch('/my-applications', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const applications = await res.json();
        console.log("Fetched applications:", applications);

        document.getElementById('sentApplicationsCount').textContent = applications.length;

        if (!applications.length) {
            container.innerHTML = `<p>No applications submitted yet.</p>`;
            return;
        }

        applications.forEach(app => {
            const card = document.createElement('div');
            card.className = 'application-card'; // this class should be styled in your CSS

            let statusColor = 'gray';
            if (app.Status === 'approved') statusColor = 'green';
            else if (app.Status === 'declined') statusColor = 'red';

            card.innerHTML = `
    <div class="application-info">
        <h3>Application for organizer role</h3>
        <p><strong>Email:</strong> ${app.Email}</p>
        <p><strong>Phone:</strong> ${app.Phone || '-'}</p>
        <p><strong>Organization:</strong> ${app.Organization || 'N/A'}</p>
        <p><strong>Experience:</strong> ${app.Experience || '-'}</p>
        <p><strong>Why Join:</strong> ${app.WhyJoin || '-'}</p>
        <p><strong>Status:</strong> 
            <span class="status ${app.Status?.toLowerCase()}">
                ${app.Status || 'pending'}
            </span>
        </p>
    </div>
`;


            container.appendChild(card);
        });

    } catch (err) {
        console.error('Failed to load applications:', err);
        container.innerHTML = `<p style="color: red;">Failed to load applications. Please try again later.</p>`;
    }
});
