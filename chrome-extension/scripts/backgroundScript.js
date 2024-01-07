chrome.tabs.onUpdated.addListener((tabId, tab) => {
    chrome.storage.local.remove("cachedTextElements");
    chrome.storage.local.remove("hiddenTextElements");
    chrome.storage.local.remove("parsedElements");
});

