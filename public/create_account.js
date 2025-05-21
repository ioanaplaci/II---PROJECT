const ageDropdown = document.querySelector('.dropdown');
    const selected = document.querySelector('.dropdown-selected');
    const optionsContainer = document.getElementById('age-options');
    const ageHidden = document.getElementById('age-hidden');

    for (let i = 0; i <= 100; i++) {
        const option = document.createElement('div');
        option.classList.add('dropdown-option');
        option.textContent = i;
        option.dataset.value = i;
        optionsContainer.appendChild(option);
    }

    selected.addEventListener('click', () => {
        optionsContainer.style.display = optionsContainer.style.display === 'block' ? 'none' : 'block';
    });

    optionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('dropdown-option')) {
            const value = e.target.dataset.value;
            selected.textContent = value;
            ageHidden.value = value;
            optionsContainer.style.display = 'none';
        }
    });

    window.addEventListener('click', (e) => {
        if (!ageDropdown.contains(e.target)) {
            optionsContainer.style.display = 'none';
        }
    });

    document.querySelector('.submit-btn').addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent default form submission
    
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const age = document.getElementById('age-hidden').value;
    
        // 🔍 Basic field check
        if (!firstName || !lastName || !email || !password || !age) {
            showNotification("Please fill in all fields.");
            return;
        }
    
        // 📧 Email format check
        const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailPattern.test(email)) {
            showNotification("Please enter a valid email address.");
            return;
        }
    
        // 🔐 Password length check
        if (password.length < 3) {
            showNotification("Password must be at least 3 characters long.");
            return;
        }
    
        try {
            const res = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ firstName, lastName, email, password, age })
            });
    
            const data = await res.json();
    
            if (data.success) {
                showNotification('Account created!');
                window.location.href = 'login.html';
            } else {
                showNotification('Failed to create account: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error during registration:', err);
            showNotification('An unexpected error occurred. Please try again.');
        }
    });
    
    function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.remove('hidden');
        setTimeout(() => notification.classList.add('hidden'), 3000);
    }
    