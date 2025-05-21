function elementExists(selector) {
    return document.querySelector(selector) !== null;
}

// Test 1: Verify role counters match actual cards
function testRoleCounters() {
    if (!elementExists('#usersContainer')) {
        console.log("❌ Users container missing - tests aborted");
        return;
    }

    const clientCards = document.querySelectorAll('.user-card .role-dropdown option:checked[value="client"]').length;
    const organizerCards = document.querySelectorAll('.user-card .role-dropdown option:checked[value="organizer"]').length;
    const adminCards = document.querySelectorAll('.user-card .role-dropdown option:checked[value="admin"]').length;

    const displayedClients = parseInt(document.getElementById('clientCount')?.textContent || 0);
    const displayedOrganizers = parseInt(document.getElementById('organizerCount')?.textContent || 0);
    const displayedAdmins = parseInt(document.getElementById('adminCount')?.textContent || 0);

    console.log(clientCards === displayedClients ?
        "✅ Client counter matches cards" :
        `❌ Client mismatch: ${clientCards} cards vs ${displayedClients} counter`);

    console.log(organizerCards === displayedOrganizers ?
        "✅ Organizer counter matches cards" :
        `❌ Organizer mismatch: ${organizerCards} cards vs ${displayedOrganizers} counter`);

    console.log(adminCards === displayedAdmins ?
        "✅ Admin counter matches cards" :
        `❌ Admin mismatch: ${adminCards} cards vs ${displayedAdmins} counter`);
}

// Test 2: Verify search
function testUserSearch(containerId, inputId) {
    const searchTerm = document.getElementById(inputId)?.value.trim().toLowerCase();
    if (!searchTerm) {
        console.log(`🔍 ${inputId}: Empty input — no test run`);
        return;
    }

    const userCards = [...document.querySelectorAll(`#${containerId} .user-card`)];
    const visibleCards = userCards.filter(card => card.style.display !== 'none');

    if (visibleCards.length === 0) {
        console.log(`✅ ${inputId}: No users shown for "${searchTerm}" — correct if none exist.`);
    } else if (visibleCards.every(card => {
        // Assume user name is in an h3 element inside card
        const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
        return name.includes(searchTerm);
    })) {
        console.log(`✅ ${inputId}: Correct users are shown for "${searchTerm}"`);
    } else {
        console.log(`❌ ${inputId}: Some visible users do not match "${searchTerm}"`);
    }
}

// Test 3: Check button states
function testButtons() {
    const saveButtons = document.querySelectorAll('.btn-save');
    const deleteButtons = document.querySelectorAll('.btn-danger');

    console.log(saveButtons.length > 0 ?
        `✅ Found ${saveButtons.length} save button(s)` :
        "❌ No save buttons found");

    console.log(deleteButtons.length > 0 ?
        `✅ Found ${deleteButtons.length} delete button(s)` :
        "❌ No delete buttons found");
}

// Test 4: Verify first user card data
function testFirstUserCard() {
    const firstCard = document.querySelector('.user-card');
    if (!firstCard) {
        console.log("❌ No user cards found");
        return;
    }

    const name = firstCard.querySelector('h3')?.textContent?.trim();
    const email = firstCard.querySelector('.fa-envelope')?.parentElement?.textContent?.trim();

    console.log(name ? `✅ First user: ${name}` : "❌ Missing user name");
    console.log(email ? `✅ Email: ${email}` : "❌ Missing email");
}

// Run all tests with safety checks
function runTests() {
    testRoleCounters();
    testButtons();
    testFirstUserCard();
}

// Start tests after DOM and main JS load
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(runTests, 1000); // Brief delay for data to load

    const searchButton = document.querySelector('.search-btn');
    const searchInput = document.getElementById('userSearch');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            setTimeout(() => testUserSearch('usersContainer', 'userSearch'), 100);
        });
    }
});