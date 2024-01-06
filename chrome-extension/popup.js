// script.js
document.getElementById('toggleBlurCheckbox').addEventListener('change', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const message = document.getElementById('toggleBlurCheckbox').checked ? 'blurText' : 'unblurText';
        chrome.tabs.sendMessage(tabs[0].id, { message });
    });
});
