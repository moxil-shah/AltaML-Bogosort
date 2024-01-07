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
  }, 200);  // Adjust the timeout duration as needed
}

let batch = [];
function batchTextElements(elementToBatch) {
  batch.push();
}

function filterTextElements(textElements) {
  let returnElements = [];

  // Filter out elements that are too small
  for (let i = 0; i < textElements.length; i++) {
    let e = textElements[i];
    if (e.textContent.length > 1) {
      returnElements.push(e);
    }
  }

  return returnElements;
}

function observeTextElements() {
  let textElements = document.querySelectorAll(
      'h1, h2, h3, h4, h5, p, li, td, caption, span, a');  // Add more elements
  // as needed
  textElements = filterTextElements(textElements);
  // take first 10 elements
  textElements = textElements.slice(0, 2);
  console.log(textElements);


  let promise = chrome.storage.sync.get(['cachedTextElements'])

  Promise.resolve(promise).then((result) => {
    if (result && result.cachedTextElements) {
      console.log('Value currently is ', result.cachedTextElements);
      //   for (let i = 0; i < result.cachedTextElements.length; i++) {
      //     let e = result.cachedTextElements[i];
      //     console.log(e);
      //   }
    } else {
      console.log('Cached text elements not found in storage.');
    }
  });

  chrome.storage.sync.set({'cachedTextElements': textElements})
      .then(() => {
        console.log('Value is set');
        // Any code that relies on the completion of set operation should be
        // placed here.
      })
      .catch(error => console.error(error));
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
const observerConfig = {
  childList: true,
  subtree: true
};
observer.observe(document.body, observerConfig);

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded')
  observeTextElements();
});
