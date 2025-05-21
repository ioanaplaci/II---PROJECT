let currentApplicationCard = null;

function showApplication(button) {
    const card = button.closest('.application-card');
    const data = JSON.parse(card.dataset.application);

    document.getElementById('applicantName').textContent = data.Name;
    document.getElementById('applicantEmail').textContent = data.Email;
    document.getElementById('applicantPhone').textContent = data.Phone || 'N/A';
    document.getElementById('applicantOrg').textContent = data.Organization || 'N/A';
    document.getElementById('applicantExperience').textContent = data.Experience || '-';
    document.getElementById('applicantWhyJoin').textContent = data.WhyJoin || '-';

    document.getElementById('modalOverlay').style.display = 'flex';
    currentApplicationCard = card;
}

    function closeModal() {
        document.getElementById('modalOverlay').style.display = 'none';
        currentApplicationCard = null;
    }


    function updateApplicationCount() {
        const applicationCards = document.querySelectorAll('.application-card');
        const eventRequestCards = document.querySelectorAll('.event-request-card');
    
        document.getElementById('pendingApplicationsCount').textContent = applicationCards.length;
    
        document.getElementById('eventRequestCount').textContent = eventRequestCards.length || 0;
    }
    
    window.addEventListener('DOMContentLoaded', () => {
        updateApplicationCount();
    });

    async function handleApplication(approved) {
        if (!currentApplicationCard) return;
    
        const appData = JSON.parse(currentApplicationCard.dataset.application);
        const email = appData.Email;
        const id = appData.Id;
    
        try {
            const res = await fetch('/respond-application', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({
                    Id: id,
                    Email: email,
                    decision: approved ? 'approved' : 'declined'
                })
            });
    
            const data = await res.json();
    
            if (data.success) {
                alert(`Application ${approved ? 'approved' : 'declined'} successfully.`);
                currentApplicationCard.remove();
                closeModal();
                updateApplicationCount();
            } else {
                alert(data.message || 'Failed to update status.');
            }
        } catch (err) {
            console.error('Error handling application:', err);
            alert('Unexpected error.');
        }
    }
    
    
    
    

    // Close modal when clicking outside
    document.getElementById('modalOverlay').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });

    // Close modal with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Keep existing sidebar functionality
    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('expanded');
    }

    // Search functionality
    function handleSearch() {
        const searchTerm = document.getElementById('userSearch').value.toLowerCase();
        const cards = document.querySelectorAll('.application-card');

        cards.forEach(card => {
            const text = card.dataset.application.toLowerCase();
            if(text.includes(searchTerm)) {
                card.style.display = 'flex';
                card.classList.add('highlight');
                setTimeout(() => card.classList.remove('highlight'), 1000);
            } else {
                card.style.display = 'none';
            }
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        const container = document.querySelector('.applications-container');
        const token = localStorage.getItem('token');
    
        try {
            const res = await fetch('/admin-applications', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
    
            const applications = await res.json();
    
            applications
            .filter(app => app.Status === 'pending')  // Only show pending
            .forEach(app => {
                const card = document.createElement('div');
                card.className = 'admin-card application-card';
                card.dataset.application = JSON.stringify(app);
        
                card.innerHTML = `
                    <div class="application-info">
                        <h3>${app.Name}</h3>
                        <p><i class="fas fa-envelope"></i> ${app.Email}</p>
                        <p><i class="fas fa-phone"></i> ${app.Phone}</p>
                    </div>
                    <button class="btn btn-view" onclick="showApplication(this)">
                        <i class="fas fa-file-alt"></i> View Application
                    </button>
                `;
                container.appendChild(card);
            });
        
            
    
            updateApplicationCount();
    
        } catch (err) {
            console.error('Failed to load applications:', err);
        }
    });
    