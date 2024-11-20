  let darkModeEnabled = true; 

document.getElementById("modeToggle").addEventListener("click", async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab && tab.url && !tab.url.startsWith("chrome://")) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: toggleMode,
      });
      toggleIcon(); // Call the function to switch the icon after toggling dark mode
    } else {
      alert("This extension cannot run on Chrome internal pages.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});


function toggleMode() {
  if (darkModeEnabled) {
    disableDarkMode();
  } else {
    enableDarkMode();
  }

}

function enableDarkMode() {
  const elements = document.querySelectorAll("*");

  // Set a global dark theme for body
  document.body.style.setProperty("background-color", "#121212", "important");
  document.body.style.setProperty("color", "#ffffff", "important");

  // Helper function to calculate brightness
  function calculateBrightness(rgbString) {
    const rgb = rgbString.match(/\d+/g).map(Number);
    return (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114);
  }

  // Process elements incrementally for performance
  let index = 0;

  function processNextBatch() {
    const batchSize = 50; // Adjust for performance
    const batch = Array.from(elements).slice(index, index + batchSize);

    batch.forEach((el) => {
      const computedStyle = window.getComputedStyle(el);

      // Skip non-visible elements
      if (computedStyle.visibility === "hidden" || computedStyle.display === "none") return;

      // Handle background color
      if (computedStyle.backgroundColor && computedStyle.backgroundColor !== "transparent") {
        const brightness = calculateBrightness(computedStyle.backgroundColor);
        if (brightness > 128) {
          el.style.setProperty("background-color", "#121212", "important"); // Darken light backgrounds
        }
      }

      // Handle text color
      if (computedStyle.color) {
        const brightness = calculateBrightness(computedStyle.color);
        if (brightness < 128) {
          el.style.setProperty("color", "#ffffff", "important"); // Lighten dark text
        }
      }

      // Handle links specifically
      if (el.tagName === "A") {
        el.style.setProperty("color", "#BB86FC", "important"); // Purple for links
      }
    });

    // Move to the next batch
    index += batchSize;

    if (index < elements.length) {
      requestAnimationFrame(processNextBatch);
    }
  }

  // Start processing elements
  processNextBatch();
}

function disableDarkMode() {
  document.body.style.backgroundColor = "";
  document.body.style.color = "";
}

// Function to toggle the icon between light and dark mode
function toggleIcon() {
  const lightIcon = document.querySelector("img[alt='lightMode']");
  const darkIcon = document.querySelector("img[alt='darkMode']");

  if (lightIcon && darkIcon) {
    lightIcon.classList.toggle("d-none"); // Hide the light mode icon
    darkIcon.classList.toggle("d-none"); // Show the dark mode icon
  }
}
