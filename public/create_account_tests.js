// Test 1: Verify element existence (no interaction)
function testFormElements() {
    const requiredElements = [
        { selector: '#firstName', desc: 'First name input' },
        { selector: '#lastName', desc: 'Last name input' },
        { selector: '#email', desc: 'Email input' },
        { selector: '#password', desc: 'Password input' },
        { selector: '.dropdown-selected', desc: 'Age dropdown' },
        { selector: '.submit-btn', desc: 'Submit button' }
    ];

    requiredElements.forEach(element => {
        console.log(document.querySelector(element.selector) ?
            `✅ ${element.desc} exists` :
            `❌ ${element.desc} missing`);
    });
}

// Test 2: Verify age dropdown structure
function testAgeDropdownStructure() {
    const options = document.querySelectorAll('.dropdown-option');
    console.log(options.length === 101 ?
        "✅ Age dropdown has 101 options (0-100)" :
        `❌ Incorrect number of age options (${options.length})`);
}

// Test 3: Verify field requirements
function testFieldRequirements() {
    const requiredAttrs = [
        { selector: '#firstName', attr: 'required' },
        { selector: '#lastName', attr: 'required' },
        { selector: '#email', attr: 'required' },
        { selector: '#password', attr: 'required' }
    ];

    requiredAttrs.forEach(field => {
        const hasAttribute = document.querySelector(field.selector)?.hasAttribute(field.attr);
        console.log(hasAttribute ?
            `✅ ${field.selector} is required` :
            `❌ ${field.selector} missing required attribute`);
    });
}

// Test 4: Submit button
function testSubmitButton() {
    const btn = document.querySelector('.submit-btn');
    if (!btn) return;

    console.log(!btn.disabled ? "✅ Submit Button is enabled" : "❌ Button is disabled");
}

// Run tests
function runTests() {
    testFormElements();
    testAgeDropdownStructure();
    testFieldRequirements();
    testSubmitButton()
}

// Initiate tests
if (document.readyState === 'complete') {
    runTests();
} else {
    window.addEventListener('DOMContentLoaded', runTests);
}