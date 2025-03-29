document.addEventListener("DOMContentLoaded", function () {
  // Load saved settings from chrome.storage.local
  chrome.storage.local.get(["blockerSettings"], function(data) {
    if (data.blockerSettings) {
      const settings = data.blockerSettings;
      document.getElementById("enabled").checked = settings.enabled !== false; // default to enabled
      document.getElementById("websites").value = settings.websites ? settings.websites.join("\n") : "";
      document.getElementById("startTime").value = settings.startTime || "09:00";
      document.getElementById("endTime").value = settings.endTime || "17:00";
      ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].forEach(day => {
        if (settings.days && settings.days.hasOwnProperty(day)) {
          document.getElementById(day).checked = settings.days[day];
        }
      });
    }
  });

  // Form submission handler
  const form = document.getElementById("blockerForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get the enabled switch value
    const enabled = document.getElementById("enabled").checked;

    // Get websites from the textarea (one per line)
    const websites = document.getElementById("websites").value
      .split("\n")
      .map(site => site.trim())
      .filter(site => site.length > 0);

    // Get start and end times
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;

    // Get active days from checkboxes
    const days = {
      monday: document.getElementById("monday").checked,
      tuesday: document.getElementById("tuesday").checked,
      wednesday: document.getElementById("wednesday").checked,
      thursday: document.getElementById("thursday").checked,
      friday: document.getElementById("friday").checked,
      saturday: document.getElementById("saturday").checked,
      sunday: document.getElementById("sunday").checked
    };

    // Create settings object
    const settings = { enabled, websites, startTime, endTime, days };

    // Save settings to chrome.storage.local
    chrome.storage.local.set({ blockerSettings: settings }, function() {
      alert("Settings saved!");
    });
  });
});

