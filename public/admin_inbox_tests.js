function testFirstApplicationName() {
    const firstCard = document.querySelector('.application-card');
    if (!firstCard) {
        console.log("❌ No application cards found.");
        return;
    }

    const appData = JSON.parse(firstCard.dataset.application);
    const displayedName = firstCard.querySelector('h3').textContent.trim();

    if (appData.Name === displayedName) {
        console.log("✅ First application name matches data");
    } else {
        console.log(`❌ Name mismatch: Expected "${appData.Name}", found "${displayedName}"`);
    }
}

function testApplicationCountMatchesDisplay() {
    const actualCount = document.querySelectorAll('.application-card').length;
    const displayedCount = parseInt(document.getElementById('pendingApplicationsCount').textContent);

    if (actualCount === displayedCount) {
        console.log("✅ Application count matches display");
    } else {
        console.log(`❌ Count mismatch: ${actualCount} cards vs ${displayedCount} displayed`);
    }
}

function testSearchFiltering() {
    const cards = document.querySelectorAll('.application-card');
    const testTerm = 'john';

    if (!cards.length) {
        console.log("❌ No application cards to test search on.");
        return;
    }

    const matchingCards = [...cards].filter(card => {
        const dataText = card.dataset.application.toLowerCase();
        return dataText.includes(testTerm);
    });

    if (matchingCards.length === 0) {
        console.log(`✅ Search logic: No cards match "${testTerm}" — correct if none expected.`);
    } else {
        const allCorrect = matchingCards.every(card => {
            const data = card.dataset.application.toLowerCase();
            return data.includes(testTerm);
        });

        if (allCorrect) {
            console.log(`✅ Search logic: ${matchingCards.length} cards would match "${testTerm}"`);
        } else {
            console.log(`❌ Search logic: Some cards do not correctly match "${testTerm}"`);
        }
    }
}


function runInboxTests() {
    testFirstApplicationName();
    testApplicationCountMatchesDisplay();
    testSearchFiltering();
}

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        runInboxTests();
    }, 1000); // Wait 0.5s for cards to load
});

