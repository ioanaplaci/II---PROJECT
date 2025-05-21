document.querySelector('.login-btn').addEventListener('click', async (e) => {
    e.preventDefault();

    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;

    // Validate inputs (optional)
    // if (!email || !password) {
    //     alert('Please enter both email and password.');
    //     return;
    // }

    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            showNotification("Login successful!", "success");
            setTimeout(() => {
                window.location.href = data.redirectTo;
            }, 1500); // Wait a bit to show the message before redirecting
        } else {
            showNotification("Invalid email or password.", "error");
        }        
    } catch (err) {
        console.error('Login request failed:', err);
        showNotification('Login failed due to server error.');
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