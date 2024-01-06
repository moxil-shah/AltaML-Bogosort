
let currentURL;
let currentTabId;

function handleIntersection(entries, observer) {
    entries.forEach(entry => {
        process(entry.target);
    });
}

let batch = [];
function batchTextElements(elementToBatch) {
    
    batch.push();
}

function process(element) {
    batch.push(element);
    if (batch.length === 10) {
        // send batch to backend
        sendBatch(batch);
        // clear batch
        batch = [];
    }
}

function sendBatch(batch) {
    const backendURL = 'http://localhost:5000/predict';
    const results = fetch(backendURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: batch.map(element => element.textContent),
        }),
    })
    // NOT DONE

}

function observeTextElements() {
    const textElements = document.querySelectorAll('p, h1, h2, h3, span, div'); // Add more elements as needed
    const observer = new IntersectionObserver(handleIntersection);
    textElements.forEach(textElement => {
      observer.observe(textElement);
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'tabUpdated') {
        observeTextElements();
    }
});


