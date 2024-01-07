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

  // remove duplicates from returnElements
  let uniqueElements = [];
  let uniqueElementTexts = [];
  for (let i = 0; i < returnElements.length; i++) {
    let e = returnElements[i];
    if (!uniqueElementTexts.includes(e.textContent)) {
      uniqueElements.push(e);
      uniqueElementTexts.push(e.textContent);
    }
  }

  return uniqueElements;
}

function updateCache(textElements) {
  chrome.storage.local.get(['cachedTextElements']).then((result) => {
    if (result) {
      console.log('Value currently is ', result);

      // only set elements if they are different from the cached elements
      for (let i = 0; i < textElements.length; i++) {
        let e = textElements[i];
        if (!result.cachedTextElements.includes(e.textContent)) {
          result.cachedTextElements.push(e.textContent);
        } else {
          textElements.splice(i, 1);
        }
      }

      chrome.storage.local.set(
          {'cachedTextElements': result.cachedTextElements});

    } else {
      console.log('Cached text elements not found in storage.');
    }
  });
}


function observeTextElements() {
  let textElements = document.querySelectorAll(
      'h1, h2, h3, h4, h5, p, li, td, caption, span, a');
  textElements = filterTextElements(textElements);
  updateCache(textElements);


  return textElements;
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
