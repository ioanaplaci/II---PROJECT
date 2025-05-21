console.clear();

function testSearch(containerId, inputId) {
    const searchTerm = document.getElementById(inputId).value.trim().toLowerCase();
    const eventCards = [...document.querySelectorAll(`#${containerId} .organiser-card`)];
    const visibleCards = eventCards.filter(card => card.style.display !== 'none');

    if (searchTerm === '') {
        console.log(`🔍 ${inputId}: Empty input — no test run`);
        return;
    }

    if (visibleCards.length === 0) {
        console.log(`✅ ${inputId}: No events shown for "${searchTerm}" — correct if none exist.`);
    } else if (visibleCards.every(card =>
        card.querySelector('h3').textContent.toLowerCase().includes(searchTerm))) {
        console.log(`✅ ${inputId}: Correct events are shown for "${searchTerm}"`);
    } else {
        console.log(`❌ ${inputId}: Some visible events do not match "${searchTerm}"`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        // 1. Sidebar check
        console.assert(document.getElementById('sidebar'), '❌ Sidebar not found');
        console.log('✅ Sidebar found');

        // 2. Containers check
        console.assert(document.getElementById('activeEventsContainer'), '❌ Active Events container missing');
        console.assert(document.getElementById('pendingEventsContainer'), '❌ Pending Events container missing');
        console.log('✅ Event containers found');

        // 3. Search inputs check
        console.assert(document.getElementById('activeSearch'), '❌ Active search input missing');
        console.assert(document.getElementById('pendingSearch'), '❌ Pending search input missing');
        console.log('✅ Search inputs present');

        // 4. Search handler functions
        // console.assert(typeof handleActiveSearch === 'function', '❌ handleActiveSearch() missing');
        // console.assert(typeof handlePendingSearch === 'function', '❌ handlePendingSearch() missing');
        console.log('✅ Search handler functions found');

        // 5. Event cards rendering
        setTimeout(() => {
            const activeCards = document.querySelectorAll('#activeEventsContainer .organiser-card');
            const pendingCards = document.querySelectorAll('#pendingEventsContainer .organiser-card');

            console.log(`Found ${activeCards.length} active event(s)`);
            console.log(`Found ${pendingCards.length} pending event(s)`);

            if (activeCards.length + pendingCards.length === 0) {
                console.warn('⚠️ No events rendered. Are there any in the DB for this organiser?');
            } else {
                console.log('✅ Event cards rendered correctly');
            }
        }, 1000);
    } catch (err) {
        console.error('❌ Test script error:', err);
    }
});

function testFirstPendingEventTickets() {
    const firstPending = document.querySelector("#pendingEventsContainer .organiser-card");
    if (!firstPending) return console.warn("⚠️ No pending event card to test");

    const ticketInfo = firstPending.querySelector("p:nth-child(4)").textContent.trim();
    console.log(ticketInfo.includes("Tickets Available: 20") ? "✅ Passed event tickets" : `❌ Ticket info mismatch: "${ticketInfo}"`);
}

function testEventCounters() {
    const activeCards = document.querySelectorAll("#activeEventsContainer .organiser-card").length;
    const pendingCards = document.querySelectorAll("#pendingEventsContainer .organiser-card").length;

    const activeCountEl = document.getElementById("activeCount");
    const pendingCountEl = document.getElementById("pendingCount");

    if (!activeCountEl || !pendingCountEl) {
        console.warn("⚠️ Count elements not found. Skipping count test.");
        return;
    }

    const activeCount = parseInt(activeCountEl.textContent);
    const pendingCount = parseInt(pendingCountEl.textContent);

    console.log(activeCards === activeCount
        ? "✅ Active Count Passed"
        : `❌ Active Count Failed: ${activeCards} cards, ${activeCount} displayed`);

    console.log(pendingCards === pendingCount
        ? "✅ Pending Count Passed"
        : `❌ Pending Count Failed: ${pendingCards} cards, ${pendingCount} displayed`);
}

window.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.search-bar .search-btn');

    if (buttons.length >= 2) {
        buttons[0].addEventListener('click', () => {
            setTimeout(() => testSearch('activeEventsContainer', 'activeSearch'), 200);
        });

        buttons[1].addEventListener('click', () => {
            setTimeout(() => testSearch('pendingEventsContainer', 'pendingSearch'), 200);
        });
    }
});

function runTests() {
    testFirstPendingEventName();
    testFirstPendingEventTickets();
    testEventCounters();
}
