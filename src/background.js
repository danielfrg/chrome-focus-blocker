// Global variable to store settings in memory
let blockerSettings = null;

// Load settings from storage
function loadSettings(callback) {
  chrome.storage.local.get(["blockerSettings"], function(data) {
    blockerSettings = data.blockerSettings || null;
    if (callback) callback();
  });
}

// Helper: Check if current time is within the block schedule
function isWithinBlockedTime(startTime, endTime) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  
  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Schedule spans midnight
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}

// Helper: Check if today's day is active in the settings
function isTodayActive(days) {
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const todayName = dayNames[new Date().getDay()];
  return days[todayName];
}

// Update dynamic rules based on settings
function updateBlockingRules() {
  // Load previous rule count from storage
  chrome.storage.local.get(["prevRuleCount"], function(data) {
    const prevCount = data.prevRuleCount || 0;
    
    // Remove the dynamic rules that were set last time
    const ruleIdsToRemove = [];
    for (let i = 1; i <= prevCount; i++) {
      ruleIdsToRemove.push(i);
    }
    
    chrome.declarativeNetRequest.updateDynamicRules(
      { removeRuleIds: ruleIdsToRemove },
      () => {
        // If settings are missing or blocking is disabled, reset the previous count and exit
        if (!blockerSettings || !blockerSettings.enabled) {
          chrome.storage.local.set({ prevRuleCount: 0 });
          return;
        }

        // Create new dynamic rules for each website if the blocking conditions are met
        const newRules = blockerSettings.websites.map((domain, index) => {
          if (
            isWithinBlockedTime(blockerSettings.startTime, blockerSettings.endTime) &&
            isTodayActive(blockerSettings.days)
          ) {
            return {
              id: index + 1,
              priority: 1,
              action: { type: "block" },
              condition: {
                urlFilter: domain,
                resourceTypes: ["main_frame"]
              }
            };
          }
          return null;
        }).filter(rule => rule !== null);

        // Add new dynamic rules
        if (newRules.length > 0) {
          chrome.declarativeNetRequest.updateDynamicRules({ addRules: newRules }, () => {
            // Save the new rule count for future updates
            chrome.storage.local.set({ prevRuleCount: newRules.length });
          });
        } else {
          // No new rules, so reset the previous count
          chrome.storage.local.set({ prevRuleCount: 0 });
        }
      }
    );
  });
}


// Initial load and update of rules
loadSettings(updateBlockingRules);

// Listen for changes in settings
chrome.storage.onChanged.addListener(function(changes, areaName) {
  if (areaName === "local" && changes.blockerSettings) {
    blockerSettings = changes.blockerSettings.newValue;
    updateBlockingRules();
  }
});

// Set an alarm to update the rules every minute so that changes in the time are reflected
chrome.alarms.create("updateRules", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "updateRules") {
    loadSettings(updateBlockingRules);
  }
});
