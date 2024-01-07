const BACKEND_URL = "http://localhost:5000";

export async function getActiveTabURL() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });
  return tabs[0];
}

/*
1. Trim and remove the duplicate elements that we have arleady checked (Cache)
2. Send to batch processor
3. BEfore making request, .map each node to trimmed text Content
4. Use the ordering to get back results and blur shit
*/

class BatchRequestProcessor {
  constructor(batchSize, asyncFunction) {
    this.batchSize = batchSize;
    this.asyncFunction = asyncFunction;
    this.queue = [];
  }

  addToQueue(element) {
    this.queue.push(element);
    if (this.queue.length === this.batchSize) {
      this.processQueue(this.queue);
      this.queue = [];
    }
  }

  // async processQueue(nodeElements=[]) {

  //   // post request with body
  //   const results = await fetch(BACKEND_URL + "/predict", {
  //     method: 'POST',
  //     headers: {
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({ content: nodeElements.map(e => e.textContent.trim())})
  //   }).then(res => res.json());

  //   for (let i = 0; i < nodeElements.length; i++) {
  //     const { }
  //   }



  // }

}
