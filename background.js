// background.js

// Helper function to format a Date object as "YYYY.MM.DD HH:MM:SS"
function formatDateTime(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}:${ss}`;
}

// Save the current session (all windows and their tab URLs).
// Measures the time required and stores it in the session data as "saveDuration".
// Helper to purge sessions in memory.
function purgeSessionsInMemory(sessions, currentDate) {
  // Helper to get YYYY-MM from "YYYY-MM-DD"
  const getMonthStr = (dateStr) => dateStr.substring(0, 7);
  const currentMonth = getMonthStr(currentDate);

  const sessionsByDay = {};
  const sessionsByMonth = {};

  // Separate sessions not from today
  const pastSessions = sessions.filter(s => s.date !== currentDate);
  const todaySessions = sessions.filter(s => s.date === currentDate);

  pastSessions.forEach(session => {
    if (!session.date) return; // Guard against missing date
    const sessionMonth = getMonthStr(session.date);
    if (sessionMonth === currentMonth) {
      // For current month, group by day
      if (!sessionsByDay[session.date]) {
        sessionsByDay[session.date] = [];
      }
      sessionsByDay[session.date].push(session);
    } else {
      // For previous months, group by month
      if (!sessionsByMonth[sessionMonth]) {
        sessionsByMonth[sessionMonth] = [];
      }
      sessionsByMonth[sessionMonth].push(session);
    }
  });

  let sessionsToKeep = [];

  // 1. Keep latest session for each past day of current month
  for (const date in sessionsByDay) {
    const group = sessionsByDay[date];
    if (group.length > 0) {
      const lastSession = group.reduce((a, b) => (a.id > b.id ? a : b));
      sessionsToKeep.push(lastSession);
    }
  }

  // 2. Keep latest session for each previous month
  for (const month in sessionsByMonth) {
    const group = sessionsByMonth[month];
    if (group.length > 0) {
      const lastSession = group.reduce((a, b) => (a.id > b.id ? a : b));
      sessionsToKeep.push(lastSession);
    }
  }

  // 3. Keep all sessions from today
  const newSessions = [...todaySessions, ...sessionsToKeep];

  // Sort by ID to keep storage tidy
  newSessions.sort((a, b) => a.id - b.id);

  return newSessions;
}

// Save the current session (all windows and their tab URLs).
// Measures the time required and stores it in the session data as "saveDuration".
function saveSession(callback) {
  const startTime = performance.now();
  const now = new Date();
  const currentDate = now.toISOString().split("T")[0]; // e.g., "2025-03-05"

  // Get all windows with their tabs.
  chrome.windows.getAll({ populate: true }, function (windows) {
    // Process each window: store only each tab's URL.
    const processedWindows = windows.map(win => ({
      tabs: win.tabs.map(tab => ({ url: tab.url }))
    }));

    // Build the session data.
    const sessionData = {
      id: now.getTime(),               // Unique session ID.
      timestamp: formatDateTime(now),    // Formatted date/time string.
      date: currentDate,               // Used for purging.
      windows: processedWindows,
      saveDuration: 0                  // Placeholder.
    };

    chrome.storage.local.get({ savedSessions: [] }, function (result) {
      let sessions = result.savedSessions;

      // Push the new session data.
      sessions.push(sessionData);

      // Purge sessions in memory immediately.
      sessions = purgeSessionsInMemory(sessions, currentDate);

      // First, store the session array.
      chrome.storage.local.set({ savedSessions: sessions }, function () {
        // Now measure the duration.
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Update the duration on the session object (reference is preserved in the array).
        sessionData.saveDuration = duration.toFixed(2);

        // Save the updated sessions array.
        chrome.storage.local.set({ savedSessions: sessions }, function () {
          console.log("Session saved at", sessionData.timestamp, "in", sessionData.saveDuration, "ms");
          console.log("Total sessions kept:", sessions.length);

          if (typeof callback === "function") {
            callback(sessionData);
          }
        });
      });
    });
  });
}

// Auto-save the session when a new tab or window is created.
chrome.tabs.onCreated.addListener(saveSession);
chrome.windows.onCreated.addListener(saveSession);

// Listen for manual save requests from the popup.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "manualSaveSession") {
    saveSession((sessionData) => {
      sendResponse({ status: "success", session: sessionData });
    });
    return true; // Indicates asynchronous response.
  }
});

console.log("Background script for Tab Session Manager initialized.");
