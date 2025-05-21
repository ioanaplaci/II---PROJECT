document.getElementById('organiserApplication').addEventListener('submit', async function (e) {
    e.preventDefault();

    const application = {
        name: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        organization: document.getElementById('organization').value.trim(),
        experience: document.getElementById('experience').value.trim(),
        whyJoin: document.getElementById('why').value.trim()
    };

    if (!application.name || !application.email || !application.phone || !application.experience || !application.whyJoin) {
        alert('Please fill in all required fields.');
        return;
    }

    try {
        const res = await fetch('/submit-application', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(application)
        });

        const data = await res.json();
        if (data.success) {
            window.location.href = 'organiser_inbox.html';
        } else {
            alert('Submission failed. Please try again.');
        }
    } catch (err) {
        console.error('Submission error:', err);
        alert('Something went wrong while submitting the application.');
    }
});