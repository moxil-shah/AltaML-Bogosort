/*
==============

[ E1, E2, ... ]

fetch(url, body: {[E.textContent for E in EE]})

= [{},{},{}]

*/

const BACKEND_URL = "http://127.0.0.1:5000";

let globalCurrTask;

class CheckBadEngine {
  constructor(batchSize) {
    this.batchSize = batchSize;
    this.userThresholds = [-21, -21, -21, -21, -21, -21, -21, -21];
    this.queue = [];
  }

  addToQueue(element) {
    this.queue.push(element);
    if (this.queue.length === this.batchSize) {
      this.processQueue(this.queue);
      this.queue = [];
    }
  }

  addEntireQueue(queue) {
    queue.forEach((element) => {
      this.addToQueue(element);
    });
  }

  async processQueue(nodeElements) {
    // post request with body
    console.log("processing queue with length", nodeElements.length);

    globalCurrTask = nodeElements;
    // sleep for 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (globalCurrTask !== nodeElements) {
      console.log("task changed");
      return;
    }

    const results = await fetch(BACKEND_URL + "/predict", {
      method: "POST",
      headers: {
        // "Accept": "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        content: nodeElements.map((e) => e.textContent.trim()),
      }),
    }).then((res) => res.json());
    console.log("Results: ", results);

    // run the for loop asynchronously
    await Promise.all(
      nodeElements.map((element, i) => {
        return this.blurElementIfBad(results[i], element);
      })
    );
    // for (let i = 0; i < nodeElements.length; i++) {
    //   this.blurElementIfBad(results[i], nodeElements[i]);
    // }
  }

  blurElementIfBad(result, element) {
    // check if any of the results exceed the user thresholds
    console.log("Result: ", result);
    const metrics = ["S", "H", "V", "HR", "SH", "S3", "H2", "V2"];
    let hidden = false;

    // compare to user thresholds
    Object.values(result).forEach((el) => {
      metrics.forEach((m, i) => {
        if (el[m] > this.userThresholds[i]) {
          // console.log("Hiding element: ", element.textContent);
          hidden = true;
          return;
        }
      });
    });

    // console.log(element)

    // if any of the results are bad, blur the element
    if (hidden) {
      element.style.filter = "blur(8px)";
      element.style.color = "transparent";
      element.style.textShadow = "0 0 8px #000";
    }
  }
}

const checkEngine = new CheckBadEngine(50);

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
  chrome.storage.local.get(["cachedTextElements"]).then((result) => {
    if (result) {
      console.log("Value currently is ", result);

      if (!result.cachedTextElements) {
        result.cachedTextElements = [];
      }

      // only set elements if they are different from the cached elements
      for (let i = 0; i < textElements.length; i++) {
        let e = textElements[i];
        if (!result.cachedTextElements.includes(e.textContent)) {
          result.cachedTextElements.push(e.textContent);
        } else {
          textElements.splice(i, 1);
        }
      }

      chrome.storage.local.set({
        cachedTextElements: result.cachedTextElements,
      });
    } else {
      console.log("Cached text elements not found in storage.");
    }
  });
}

function observeTextElements() {
  let textElements = document.querySelectorAll(
    "h1, h2, h3, h4, h5, p, li, td, caption, span, a"
  );
  textElements = filterTextElements(textElements);
  updateCache(textElements);
  checkEngine.addEntireQueue(textElements);
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
  subtree: true,
};
observer.observe(document.body, observerConfig);

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");
  observeTextElements();
});
