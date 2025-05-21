// Load current account info
window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Not logged in.');

    try {
        const res = await fetch('/my-account-info', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await res.json();
        if (!data.success) return alert('Failed to load user info');

        const { FirstName, LastName, Email, Age } = data.user;

        document.getElementById('infoFirstName').textContent = FirstName;
        document.getElementById('infoLastName').textContent = LastName;
        document.getElementById('infoEmail').textContent = Email;
        document.getElementById('infoAge').textContent = Age;

    } catch (err) {
        console.error('Error loading account info:', err);
        alert('Failed to load user info');
    }
});

// Update account info
document.querySelector('.change-password').addEventListener('click', async () => {
    const inputs = document.querySelectorAll('.form-control');
    const [firstName, lastName, age, password] = [...inputs].map(input => input.value.trim());

    const token = localStorage.getItem('token');
    if (!token) {
        alert('You are not logged in.');
        return;
    }

    // Define inside the scope!
    const updatedFields = {};
    if (firstName) updatedFields.FirstName = firstName;
    if (lastName) updatedFields.LastName = lastName;
    if (age) updatedFields.Age = age;
    if (password) updatedFields.Password = password;

    if (Object.keys(updatedFields).length === 0) {
        alert('Please fill at least one field to update.');
        return;
    }

    try {
        const res = await fetch('/update-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(updatedFields)
        });

        const data = await res.json();

        if (data.success) {
            alert('Account updated successfully!');
            location.reload(); // reload to refresh displayed info
        } else {
            alert('Failed to update account: ' + (data.message || 'Unknown error'));
        }
    } catch (err) {
        console.error('Update error:', err);
        alert('Error updating account');
    }
});

// Delete account
document.querySelector('.delete-account').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('You are not logged in.');

    if (!confirm('Are you sure you want to delete your account?')) return;

    try {
        const res = await fetch('/delete-account', {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await res.json();
        if (data.success) {
            alert('Account deleted successfully.');
            localStorage.removeItem('token');
            window.location.href = 'home_page.html';
        } else {
            alert('Failed to delete account.');
        }
    } catch (err) {
        console.error('Delete error:', err);
        alert('Error deleting account');
    }
});
