function runTests() {
    console.clear();
    check('#sidebar');
    check('.main-content');
    check('.event-form-container');
    check('#eventForm');
    check('.admin-header h2');

    check('#eventName', 'input');
    check('#eventLocation', 'input');
    check('#eventDate', 'input');
    check('#eventTime', 'input');
    check('#eventArtist', 'input');
    check('#eventAge', 'select');
    check('#eventTheme', 'input');
    check('#eventTickets', 'input');

    check('#notification');
    // checkScriptContains('showNotification');
    // checkScriptContains('fetch');
}

function check(selector, tagType = null) {
    const el = document.querySelector(selector);
    if (!el) {
        console.log(`❌ ${selector} not found`);
    } else if (tagType && el.tagName.toLowerCase() !== tagType.toLowerCase()) {
        console.log(`⚠️ ${selector} is not a <${tagType}>`);
    } else {
        console.log(`✅ ${selector}`);
    }
}

function checkScriptContains(keyword) {
    const found = Array.from(document.scripts).some(s => (s.textContent || '').includes(keyword));
    console.log(found ? `✅ Script contains "${keyword}"` : `⚠️ "${keyword}" not found in scripts`);
}

window.addEventListener('DOMContentLoaded', () => setTimeout(runTests, 300));
