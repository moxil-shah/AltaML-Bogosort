chrome.tabs.onUpdated.addListener((tabId, tab) => {
    chrome.storage.local.remove("cachedTextElements");
    chrome.storage.local.remove("hiddenTextElements");
    chrome.storage.local.remove("parsedElements");
	// chrome.tabs.sendMessage(tabId, { message: 'tabUpdated', tab: tab });
});


// update when scrolling
// chrome.tabs.onCommitted.addListener((activeInfo) => {
//     chrome.tabs.sendMessage(activeInfo.tabId, { message: 'tabUpdated' });
// });
