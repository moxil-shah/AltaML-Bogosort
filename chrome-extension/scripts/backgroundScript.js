chrome.tabs.onUpdated.addListener((_, _) => {
    chrome.storage.local.remove("cachedTextElements");
    chrome.storage.local.remove("hiddenTextElements");
    chrome.storage.local.remove("parsedElements");
});

chome.window.onRemoved.addListener((_, _) => {
    chrome.storage.local.remove("cachedTextElements");
    chrome.storage.local.remove("hiddenTextElements");
    chrome.storage.local.remove("parsedElements");
});