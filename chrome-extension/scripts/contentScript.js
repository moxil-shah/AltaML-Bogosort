/*
==============

[ E1, E2, ... ]

fetch(url, body: {[E.textContent for E in EE]})

= [{},{},{}]

*/

let isScrolling = false;
let scrollTimeout;

function handleScroll() {
  isScrolling = true;
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    isScrolling = false;
    observeTextElements();
  }, 200); // Adjust the timeout duration as needed
}

let batch = [];
function batchTextElements(elementToBatch) {
  batch.push();
}

function filterTextElements(textElements) {
  return textElements.filter((e) => e.textContent.length > 1);
}

function observeTextElements() {
  const textElements = document.querySelectorAll(
    "h1, h2, h3, h4, h5, p, li, td, caption, span, a"
  ); // Add more elements as needed
  textElements = filterTextElements(textElements);

  chrome.storage.local.get(["cachedTextElements"]).then((result) => {
    console.log("Value currently is " + result.key);
  });

  chrome.storage.local.set({ cachedTextElements: textElements }).then(() => {
    console.log("Value is set");
  });

  textElements.forEach((e) => console.log(e.textContent));
}

function handleDomChanges(mutations) {
  if (isScrolling) {
    return;
  }

  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      handleScroll();
    }
  });
}

// Add a MutationObserver to monitor DOM changes
const observer = new MutationObserver(handleDomChanges);
const observerConfig = { childList: true, subtree: true };
observer.observe(document.body, observerConfig);

document.addEventListener("DOMContentLoaded", () => {
  observeTextElements();
});