document.addEventListener("DOMContentLoaded", function() {
  const toggle = document.getElementById("toggleBlocking");

  // Load current blocking state from storage
  chrome.storage.local.get(["blockerSettings"], function(data) {
    // If no settings or enabled is undefined, default to true
    if (data.blockerSettings && typeof data.blockerSettings.enabled === "boolean") {
      toggle.checked = data.blockerSettings.enabled;
    } else {
      toggle.checked = true;
    }
  });

  // Listen for changes on the switch
  toggle.addEventListener("change", function() {
    // Get the current settings and update the enabled flag
    chrome.storage.local.get(["blockerSettings"], function(data) {
      const settings = data.blockerSettings || {};
      settings.enabled = toggle.checked;
      chrome.storage.local.set({ blockerSettings: settings }, function() {
        console.log("Blocking toggled to", toggle.checked);
      });
    });
  });


  const openOptionsLink = document.getElementById("openOptions");
  openOptionsLink.addEventListener("click", function() {
    chrome.runtime.openOptionsPage();
  });

});

