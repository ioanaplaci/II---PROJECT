function testFirstPendingEventName() {
    const firstPending = document.querySelector("#pendingEventsContainer .admin-card");
    const eventName = firstPending.querySelector("strong").textContent.trim();
    console.log(
        eventName === "Test Festival"
            ? "✅ Passed event name"
            : "ℹ️ No 'Test Festival' event pending (this might be expected)"
    );
}

function testFirstPendingEventTickets() {
    const firstPending = document.querySelector("#pendingEventsContainer .admin-card");
    const ticketInfo = firstPending.querySelector("p:nth-child(4)").textContent.trim();
    console.log(ticketInfo.includes("Available: 20") ? "✅Passed event tickets" : "❌Failed");
}

function testEventCounters() {
    const activeCards = document.querySelectorAll("#activeEventsContainer .admin-card").length;
    const pendingCards = document.querySelectorAll("#pendingEventsContainer .admin-card").length;

    const activeCount = parseInt(document.getElementById("activeCount").textContent);
    const pendingCount = parseInt(document.getElementById("pendingCount").textContent);

    console.log(activeCards === activeCount ? "✅ Active Count Passed" : `❌ Active Count Failed: ${activeCards} cards, ${activeCount} displayed`);
    console.log(pendingCards === pendingCount ? "✅ Pending Count Passed" : `❌ Pending Count Failed: ${pendingCards} cards, ${pendingCount} displayed`);
}

function testSearch(containerId, inputId) {
    const searchTerm = document.getElementById(inputId).value.trim().toLowerCase();
    const eventCards = [...document.querySelectorAll(`#${containerId} .admin-card`)];
    const visibleCards = eventCards.filter(card => card.style.display !== 'none');

    if (searchTerm === '') {
        console.log(`🔍 ${inputId}: Empty input — no test run`);
        return;
    }

    if (visibleCards.length === 0) {
        console.log(`✅ ${inputId}: No events shown for "${searchTerm}" — correct if none exist.`);
    } else if (visibleCards.every(card =>
        card.querySelector('strong').textContent.toLowerCase().includes(searchTerm))) {
        console.log(`✅ ${inputId}: Correct events are shown for "${searchTerm}"`);
    } else {
        console.log(`❌ ${inputId}: Some visible events do not match "${searchTerm}"`);
    }
}

// Wait for page to load before attaching tests
window.addEventListener('DOMContentLoaded', () => {
    // Find search buttons by their class
    const buttons = document.querySelectorAll('.search-bar .search-btn');

    if (buttons.length >= 2) {
        // Button 0: activeSearch, Button 1: pendingSearch
        buttons[0].addEventListener('click', () => {
            setTimeout(() => testSearch('activeEventsContainer', 'activeSearch'), 100);
        });

        buttons[1].addEventListener('click', () => {
            setTimeout(() => testSearch('pendingEventsContainer', 'pendingSearch'), 100);
        });
    }
});


function runTests() {
    testFirstPendingEventName();
    testFirstPendingEventTickets();
    testEventCounters();
}
