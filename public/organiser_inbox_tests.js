function testBasicElements() {
    const elements = [
        '#sidebar',
        '.main-content',
        '#applicationsContainer',
        '#sentApplicationsCount',
        '.admin-header h2'
    ];
    elements.forEach(selector => {
        const el = document.querySelector(selector);
        console.log(el ? `✅ ${selector}` : `❌ ${selector}`);
    });
}

function testApplicationsContainer() {
    const container = document.getElementById('applicationsContainer');
    if (!container) {
        console.log("❌ Container not found");
        console.groupEnd();
        return;
    }
    console.log(`Current content: ${container.innerHTML.length > 0 ? "Has content" : "Empty"}`);
}
function testApplicationCards() {
    setTimeout(() => {
        const cards = document.querySelectorAll('.application-card');
        if (cards.length === 0) {
            console.log("❌ No application cards found.");
        } else {
            console.log(`✅ Found ${cards.length} application card(s).`);
        }
    }, 500); // Wait 500ms after DOMContentLoaded
}


function testTokenHandling() {
    const token = localStorage.getItem('token');
    console.log(token ? "✅ Token found in localStorage" : "⚠️ No token found");

    const scripts = Array.from(document.scripts);
    const hasTokenCheck = scripts.some(script =>
        script.textContent.includes('localStorage.getItem(\'token\'') ||
        script.textContent.includes('localStorage.getItem("token"')
    );
}

function testAPIEndpoint() {
    const scripts = Array.from(document.scripts);
    const hasEndpointCall = scripts.some(script =>
        script.textContent.includes('/my-applications') &&
        script.textContent.includes('fetch(')
    );
}

if (document.readyState === 'complete') {
    runTests();
} else {
    window.addEventListener('DOMContentLoaded', runTests);
}
function runTests() {
    console.clear();
    testBasicElements();
    testApplicationsContainer();
    testTokenHandling();
    testAPIEndpoint();
}