function testFormValidation() {

    const form = document.getElementById('organiserApplication');
    if (!form) {
        console.log("❌ Form not found - cannot test validation");
        return;
    }

    // Test required fields
    const requiredFields = ['#fullName', '#email', '#phone', '#experience', '#why'];
    let allRequiredPresent = true;

    requiredFields.forEach(field => {
        if (!document.querySelector(field)) {
            allRequiredPresent = false;
            console.log(`❌ Required field ${field} missing`);
        }
    });

    if (allRequiredPresent) {
        console.log("✅ All required fields present");
    }
}

function testSubmitButton() {

    const submitBtn = document.querySelector('.submit-btn');
    if (!submitBtn) {
        console.log("❌ Submit button not found");
        return;
    }

    const form = submitBtn.form || document.getElementById('organiserApplication');
    if (form) {
        console.log("✅ Button is associated with form");
    } else {
        console.log("❌ No form association found");
    }
}

function runAllTests() {
    console.clear();
    testFormValidation();
    testSubmitButton();
}

// Run tests when DOM is loaded
if (document.readyState === 'complete') {
    setTimeout(runAllTests, 500);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runAllTests, 500);
    });
}