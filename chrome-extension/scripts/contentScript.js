/*
==============

[ E1, E2, ... ]

fetch(url, body: {[E.textContent for E in EE]})

= [{},{},{}]

*/

const BACKEND_URL = "http://127.0.0.1:8000";
const BATCH_SIZE = 30;
const MAX_ELEMENT_LENGTH = 150;
let globalCurrTask;
// store a local set of the textelements to parse
let uniqueTextElements = new Set();

class CheckBadEngine {
    constructor(batchSize) {
        this.batchSize = batchSize;
        this.userThresholds = [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3];
        this.queue = [];
        this.isProcessing = false;
    }

    addToQueue(element) {
        this.queue.push(element);
        if (!this.isProcessing) {
            this.processQueueScheduler();
        }
    }

    addEntireQueue(queue) {
        this.queue.push(...queue);
        if (!this.isProcessing) {
            this.processQueueScheduler();
        }
    }

    async processQueueScheduler() {
        while (this.queue.length > 0) {
            this.isProcessing = true;
            const nodeElements = this.queue.splice(0, this.batchSize);
            try {
                await this.processQueue(nodeElements);
            } catch (e) {
                console.log("Error: ", e);
            } finally {
                this.isProcessing = false;
            }
        }
    }

    async processQueue(nodeElements) {
        // post request with body
        globalCurrTask = nodeElements;
        // sleep for 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (globalCurrTask !== nodeElements) {
            return;
        }

        console.log("Processing queue...");

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

        // store the already calculated elements
        chrome.storage.local.get("parsedElements", function (result) {
            let parsedElements = [];
            if (result.parsedElements) {
                parsedElements = result.parsedElements;
            }
            parsedElements.push(...nodeElements.map((e) => e.textContent));
            chrome.storage.local.set({
                parsedElements: parsedElements,
            });
        });

        // run the for loop asynchronously
        await Promise.all(
            nodeElements.map((element, i) => {
                // store the already parsed elements
                return this.blurElementIfBad(results[i], element);
            })
        );
    }

    blurElementIfBad(result, element) {
        // check if any of the results exceed the user thresholds
        const metrics = ["S", "H", "V", "HR", "SH", "S3", "H2", "V2"];
        let hidden = false;

        // compare to user thresholds
        Object.values(result).forEach((el) => {
            metrics.forEach((m, i) => {
                if (el[m] > this.userThresholds[i]) {
                    hidden = true;
                    return;
                }
            });
        });

        // if any of the results are bad, blur the element
        if (hidden) {
            console.log("Hiding element: ", element.textContent);
            element.style.filter = "blur(8px)";
            element.style.color = "transparent";
            element.style.textShadow = "0 0 8px #000";
        }
    }

    setThresholds(thresholds) {
        this.userThresholds = thresholds;
    }
}

const checkEngine = new CheckBadEngine(BATCH_SIZE);

let isScrolling = false;
let scrollTimeout;

function handleScroll() {
    isScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        observeTextElements();
    }, 500); // Adjust the timeout duration as needed
}

function filterTextElements(textElements) {
    const uniqueElements = [];
    const uniqueElementTexts = new Set();

    // get rid of duplicates and empty strings
    for (const element of textElements) {
        if (element.textContent.length > 1
            &&
            (!uniqueElementTexts.has(element.textContent) && element.textContent.split(" ").length > 5)) { // for reddit copypastas where people copy the same text multiple times
            uniqueElements.push(element);
            uniqueElementTexts.add(element.textContent);
        }
    }

    // truncate long strings
    for (const element of uniqueElements) {
        if (element.textContent.length > MAX_ELEMENT_LENGTH) {
            element.textContent = element.textContent.substring(0, MAX_ELEMENT_LENGTH);
        }
    }

    // check if already parsed
    chrome.storage.local.get("parsedElements", function (result) {
        if (result.parsedElements) {
            for (let i = 0; i < uniqueElements.length; i++) {
                let e = uniqueElements[i];
                if (result.parsedElements.includes(e.textContent)) {
                    uniqueElements.splice(i, 1);
                }
            }
        }
    });

    return uniqueElements;
}

function updateCache(textElements) {
    chrome.storage.local.get(["cachedTextElements", "hiddenTextElements"]).then((result) => {
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

    // filter out texteleements that are already queued up to parse
    textElements = Array.from(textElements).filter((e) => !uniqueTextElements.has(e));
    uniqueTextElements = new Set([...uniqueTextElements, ...textElements]);

    textElements = filterTextElements(textElements);
    if (textElements.length === 0) {
        return;
    }

    console.log("Observing text elements...");
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
    observeTextElements();

    chrome.storage.sync.get("sliderDic", function (result) {
        if (result.sliderDic) {
            console.log("sliderDic found in storage: ", result.sliderDic);
            checkEngine.setThresholds(Object.values(result.sliderDic));
        }
    });
});
