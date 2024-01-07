const BACKEND_URL = "http://localhost:5000";

export async function getActiveTabURL() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });
  return tabs[0];
}

class CheckBadEngine {
  constructor(batchSize, asyncFunction) {
    this.batchSize = batchSize;
    this.asyncFunction = asyncFunction;
    this.userThresholds = [0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5]
    this.queue = [];
  }

  addToQueue(element) {
    this.queue.push(element);
    if (this.queue.length === this.batchSize) {
      this.processQueue(this.queue);
      this.queue = [];
    }
  }

  async processQueue(nodeElements) {
    // post request with body
    const results = await fetch(BACKEND_URL + "/predict", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: nodeElements.map(e => e.textContent.trim())})
    }).then(res => res.json());

    for (let i = 0; i < nodeElements.length; i++) {
      this.blurElementIfBad(results[i], nodeElements[i]);
    }
  }

  blurElementIfBad(result, element) {
    // check if any of the results exceed the user thresholds
    const { _ : { H, H2, HR, OK, S, S3, SH, V, V2 } } = result;
    const resultArray = [S, H, V, HR, SH, S3, H2, V2];

    // compare to user thresholds
    const badResults = resultArray.map((r, i) => r > this.userThresholds[i]);

    // if any of the results are bad, blur the element
    if (badResults.includes(true)) {
      element.style.filter = "blur(5px)";
    }
  }

}
