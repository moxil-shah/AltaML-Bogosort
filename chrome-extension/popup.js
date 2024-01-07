let sliderDic = {};

// Function to debounce the input events
function debounce(func, delay) {
    let timeoutId;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () {
            func.apply(context, args);
        }, delay);
    };
}

// Function to save sliderDic to Chrome storage
function saveToStorage() {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ sliderDic: sliderDic }, function () {
            resolve();
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    // Initialize sliderDic from Chrome storage on extension startup
    chrome.storage.sync.get("sliderDic", function (result) {
        if (result.sliderDic) {
            sliderDic = result.sliderDic;
        }

        const sliders = document.querySelectorAll(".form-control-range");

        sliders.forEach(function (slider) {
            const labelId = `${slider.id}Label`;
            const label = document.getElementById(labelId);

            // Set initial label text based on stored value
            label.textContent = `${slider.id} | ${sliderDic[slider.id] || 50}%`;

            // Set initial slider value based on stored value
            slider.value = sliderDic[slider.id] || 50;

            // Debounce the input event listener
            const debouncedInput = debounce(function () {
                const sliderValue = slider.value;
                label.textContent = `${slider.id} | ${sliderValue}%`;
                sliderDic[slider.id] = sliderValue;

                // Save sliderDic to Chrome storage
                saveToStorage();

                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        message: "sliderUpdated",
                        sliderDic: sliderDic,
                    });
                });

            }, 5); // Adjust the delay as needed.

            slider.addEventListener("input", debouncedInput);
        });
    });
});

// get value for blurred-count p tag from chrome sync storage
chrome.storage.sync.get("counter", function (result) {
    if (result["counter"]) {
        const blurredCounter = document.getElementById("blurred-count");
        blurredCounter.textContent = result["counter"];
    }
});

