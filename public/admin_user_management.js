function handleSearch() {
    const searchTerm = document.getElementById('userSearch').value.trim().toLowerCase();
    const users = document.querySelectorAll('.user-card');
    let foundMatch = false;

    // Reset all users first
    users.forEach(user => user.style.display = 'flex');

    if (searchTerm === '') return;

    users.forEach(user => {
        const userName = user.dataset.name.toLowerCase();
        if (!userName.includes(searchTerm)) {
            user.style.display = 'none';
        } else {
            foundMatch = true;
            if (!document.querySelector('.highlight')) {
                user.scrollIntoView({ behavior: 'smooth', block: 'center' });
                user.classList.add('highlight');
                setTimeout(() => user.classList.remove('highlight'), 1500);
            }
        }
    });

    if (!foundMatch) {
        alert(`No users found matching "${searchTerm}"`);
    }
}

// Event Listeners
document.getElementById('userSearch').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

document.querySelector('.search-btn').addEventListener('click', handleSearch);

document.querySelectorAll('.btn-save').forEach(button => {
    button.addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You are not authorized. Please log in.');
            return;
        }

        const userCard = button.closest('.user-card');
        const email = userCard.querySelector('p i.fa-envelope').parentElement.textContent.trim().split(' ')[1];
        const selectedRole = userCard.querySelector('.role-dropdown').value;

        try {
            const response = await fetch('/update-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ email, role: selectedRole })
            });

            const data = await response.json();

            if (data.success) {
                alert('Role updated successfully!');
            } else {
                alert('Failed to update role: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error while updating role:', error);
            alert('An unexpected error occurred while updating the role.');
        }
    });
});


async function loadUsers() {
    try {
        const response = await fetch('/users', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        const users = await response.json();
        const container = document.getElementById('usersContainer');
        const roleSelect = document.getElementById('roleDropdown');
        container.innerHTML = ''; // Clear any existing content

        // Count roles dynamically
        let clientCount = 0;
        let organizerCount = 0;
        let adminCount = 0;

        users.forEach(user => {
            // Count roles
            const role = user.Role?.toLowerCase();
            if (role === 'client') clientCount++;
            else if (role === 'organizer') organizerCount++;
            else if (role === 'admin') adminCount++;

            // Create user card
            const userCard = document.createElement('div');
            userCard.className = 'user-card';
            userCard.dataset.name = `${user.FirstName} ${user.LastName}`.toLowerCase();

            userCard.innerHTML = `
                <div class="user-info">
                    <div class="user-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="user-details">
                        <h3>${user.FirstName} ${user.LastName}</h3>
                        <p><i class="fas fa-envelope"></i> ${user.Email}</p>
                        <p><i class="fas fa-birthday-cake"></i> ${user.Age} years</p>
                    </div>
                </div>
                <div class="user-actions">
                    <div class="role-select">
                        <label>Role:</label>
                        <select class="role-dropdown" id="role-dropdown">
                            <option value="client" ${user.Role === 'client' ? 'selected' : ''}>Client</option>
                            <option value="organizer" ${user.Role === 'organizer' ? 'selected' : ''}>Organizer</option>
                            <option value="admin" ${user.Role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-save">
                            <i class="fas fa-save"></i> Save
                        </button>
                        <button class="btn btn-danger">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;

            // Add save button functionality
            const saveBtn = userCard.querySelector('.btn-save');
            const dropdown = userCard.querySelector('.role-dropdown');

            saveBtn.addEventListener('click', () => {
                const token = localStorage.getItem('token');

                fetch('/update-role', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        email: user.Email,
                        role: dropdown.value
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert('Role updated successfully!');
                    } else {
                        alert('Failed to update role.');
                    }
                });
            });

            container.appendChild(userCard);

            // Add delete button functionality
            const deleteBtn = userCard.querySelector('.btn-danger');

            deleteBtn.addEventListener('click', async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('You are not authorized. Please log in.');
                    return;
                }

                if (confirm(`Are you sure you want to delete ${user.Email}?`)) {
                    try {
                        const res = await fetch('/delete-user', {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token
                            },
                            body: JSON.stringify({ email: user.Email })
                        });

                        const data = await res.json();

                        if (data.success) {
                            alert('User deleted successfully!');
                            userCard.remove();
                        } else {
                            alert('Failed to delete user: ' + (data.message || 'Unknown error'));
                        }
                    } catch (error) {
                        console.error('Error while deleting user:', error);
                        alert('An unexpected error occurred while deleting the user.');
                    }
                }
            });
        });

        // Update UI counters
        document.getElementById('clientCount').textContent = clientCount;
        document.getElementById('organizerCount').textContent = organizerCount;
        document.getElementById('adminCount').textContent = adminCount;
        console.log(`Clients: ${clientCount}, Organizers: ${organizerCount}, Admins: ${adminCount}`);

    } catch (err) {
        console.error('Failed to load users:', err);
    }
}


// Load users on page load
window.addEventListener('DOMContentLoaded', loadUsers);

if (typeof runTests === 'function') {
    setTimeout(runTests, 300);
}
/*
// Count roles dynamically
let clientCount = 0;
let organizerCount = 0;
let adminCount = 0;

users.forEach(user => {
    const role = user.Role?.toLowerCase();
    if (role === 'client') clientCount++;
    else if (role === 'organizer') organizerCount++;
    else if (role === 'admin') adminCount++;
});

// Update UI counters
document.getElementById('clientCount').textContent = clientCount;
document.getElementById('organizerCount').textContent = organizerCount;
document.getElementById('adminCount').textContent = adminCount;
*/
