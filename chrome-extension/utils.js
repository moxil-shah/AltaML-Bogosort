export async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
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
        this.processQueue();
      }
    }
  
    async processQueue() {
      if (this.queue.length > 0) {
        try {
          // Call the async function with the batched elements
          await this.asyncFunction(this.queue);
  
          // Clear the queue after processing
          this.queue = [];
        } catch (error) {
          console.error('Error processing batch:', error);
        }
      }
    }
  }

