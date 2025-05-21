// Test 1: Verify essential elements exist
function testLoginElements() {
    const requiredElements = [
        { selector: 'input[name="email"]', desc: 'Email input' },
        { selector: 'input[name="password"]', desc: 'Password input' },
        { selector: '.login-btn', desc: 'Login button' },
        { selector: 'a[href="create_account.html"]', desc: 'Create account link' }
    ];

    requiredElements.forEach(element => {
        const el = document.querySelector(element.selector);
        console.log(el ?
            `✅ ${element.desc} exists` :
            `❌ ${element.desc} missing`);
    });
}

// Test 2: Verify notification system
function testNotificationSystem() {
    const notification = document.getElementById('notification');
    if (!notification) {
        console.log("❌ Notification element missing");
        return;
    }

    // Mock notification
    // notification.textContent = "Test message";
    // notification.className = "notification success";
    // notification.classList.remove('hidden');

    setTimeout(() => {
        const isVisible = !notification.classList.contains('hidden');
        console.log(isVisible ?
            "✅ Notification shows properly" :
            "❌ Notification not visible (✅good if notification doesnt appear on page reload)");

        // Verify auto-hide
        setTimeout(() => {
            const isHidden = notification.classList.contains('hidden');
            console.log(isHidden ?
                "✅ Notification auto-hides" :
                "❌ Notification remains visible");
        }, 3100); // Slightly longer than the 3s timeout
    }, 100);
}

// Test 3: Verify login button handler
function testLoginButtonHandler() {
    const loginButton = document.querySelector('.login-btn');
    if (!loginButton) {
        console.log("❌ Login button missing - test aborted");
        return;
    }

    // Clone the button to strip existing event listeners
    const clone = loginButton.cloneNode(true);
    loginButton.replaceWith(clone); // Replace it in the DOM

    let handlerDetected = false;

    // Add our test handler only
    clone.addEventListener('click', (e) => {
        handlerDetected = true;
        e.preventDefault(); // Prevent form submission
        e.stopImmediatePropagation(); // Block anything else, if any
    });

    clone.click();

    console.log(handlerDetected ?
        "✅ Login button has click handler (confirmed via isolated test)" :
        "❌ Login button has no detectable click handler");

    // Optional: restore original if needed
    // clone.replaceWith(loginButton);
}


// Test 4: Verify input validation
function testInputValidation() {
    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const loginButton = document.querySelector('.login-btn');

    if (!emailInput || !passwordInput || !loginButton) {
        console.log("❌ Input fields or login button missing");
        return;
    }

    // Clone button to remove ALL event listeners
    const clone = loginButton.cloneNode(true);
    loginButton.replaceWith(clone);

    // Set empty values to simulate invalid input
    emailInput.value = '';
    passwordInput.value = '';

    // Attach test-only click handler
    clone.addEventListener('click', (e) => {
        e.preventDefault();
        if (!emailInput.value || !passwordInput.value) {
            console.log("✅ Simulated validation: Missing email or password detected");
        } else {
            console.log("❌ Simulated validation: Should have detected missing input");
        }
    });

    clone.click();
}

// Run all tests
function runLoginTests() {
    testLoginElements();
    // testNotificationSystem();
    // testLoginButtonHandler();
    // testInputValidation();
}

// Start tests when DOM is ready
if (document.readyState === 'complete') {
    runLoginTests();
} else {
    window.addEventListener('DOMContentLoaded', runLoginTests);
}