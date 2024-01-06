chrome.tabs.onUpdated.addListener((tabId, tab) => {
	chrome.tabs.sendMessage(tabId, { message: 'tabUpdated', tab: tab });
});