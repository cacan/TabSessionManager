document.addEventListener("DOMContentLoaded", function () {
  loadSessions();

  document.getElementById("saveBtn").addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    chrome.runtime.sendMessage({ action: "manualSaveSession" }, function (response) {
      if (response && response.status === "success") {
        loadSessions();
      }
    });
  });

  // Import event listener.
  document.getElementById("importBtn").addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    importSessions();
  });
});

// Helper to extract the real URL if a tab is suspended by Marvelous Suspender.
function getRealUrl(url) {
  if (url && url.indexOf("suspended.html") !== -1) {
    let hashPart = url.split('#')[1];
    if (hashPart) {
      let params = new URLSearchParams(hashPart);
      if (params.has("uri")) {
        return decodeURIComponent(params.get("uri"));
      }
    }
  }
  return url;
}

// Load sessions from storage and render them.
function loadSessions() {
  const sessionsContainer = document.getElementById("sessions");
  // Preserve scroll position.
  const scrollPos = sessionsContainer.scrollTop;

  // Record IDs of expanded sessions.
  const expandedSessionIds = [];
  const currentDetails = sessionsContainer.querySelectorAll("details.session");
  currentDetails.forEach(details => {
    if (details.hasAttribute("open")) {
      expandedSessionIds.push(details.getAttribute("data-session-id"));
    }

    sessions.forEach(session => {
      // Count windows and total tabs.
      const numWindows = session.windows.length;
      const numTabs = session.windows.reduce((acc, win) => acc + win.tabs.length, 0);

      // Create a details element for the session.
      const details = document.createElement("details");
      details.classList.add("session");
      details.setAttribute("data-session-id", session.id);
      if (expandedSessionIds.includes(String(session.id))) {
        details.setAttribute("open", "");
      }

      // Format timestamp to "YYYY.MM.DD HH:MM" (drop seconds).
      const formattedTimestamp = session.timestamp.slice(0, 16);
      // Always show save duration (or N/A if not available).
      const timingText = " (Save: " + (session.saveDuration || "N/A") + " ms)";
      const titleText = `Session: ${formattedTimestamp}${timingText}, ${numWindows} window${numWindows !== 1 ? "s" : ""}, ${numTabs} tab${numTabs !== 1 ? "s" : ""}`;

      // Build the summary element.
      const summary = document.createElement("summary");
      summary.classList.add("session-summary");
      summary.style.display = "flex";
      summary.style.justifyContent = "space-between";
      summary.style.alignItems = "center";

      // Left container: arrow + title.
      const leftContainer = document.createElement("div");
      leftContainer.classList.add("session-header");
      leftContainer.style.display = "flex";
      leftContainer.style.alignItems = "center";

      const arrowSpan = document.createElement("span");
      arrowSpan.classList.add("session-arrow");
      arrowSpan.textContent = details.hasAttribute("open") ? "▼ " : "► ";
      leftContainer.appendChild(arrowSpan);

      const titleSpan = document.createElement("span");
      titleSpan.classList.add("session-title");
      titleSpan.textContent = titleText;
      leftContainer.appendChild(titleSpan);

      summary.appendChild(leftContainer);

      // Right side: delete session button.
      const deleteSessionButton = document.createElement("button");
      deleteSessionButton.type = "button";
      deleteSessionButton.title = "Delete Session";
      deleteSessionButton.textContent = "[x]";
      deleteSessionButton.classList.add("delete");
      deleteSessionButton.style.marginLeft = "auto";
      deleteSessionButton.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        removeSessionFromStorage(session.id);
      });
      summary.appendChild(deleteSessionButton);

      details.appendChild(summary);

      // Update arrow on toggle.
      details.addEventListener("toggle", function () {
        arrowSpan.textContent = details.open ? "▼ " : "► ";
      });

      // Content container for detailed session info.
      const contentContainer = document.createElement("div");
      contentContainer.classList.add("session-content");

      // Session-level buttons.
      const sessionButtons = document.createElement("div");
      sessionButtons.classList.add("session-buttons");
      sessionButtons.style.display = "inline-flex";
      sessionButtons.style.gap = "4px";
      sessionButtons.style.marginBottom = "6px";

      const restoreSessionButton = document.createElement("button");
      restoreSessionButton.type = "button";
      restoreSessionButton.textContent = "Restore Session";
      restoreSessionButton.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        restoreSession(session);
      });
      sessionButtons.appendChild(restoreSessionButton);

      const exportSessionButton = document.createElement("button");
      exportSessionButton.type = "button";
      exportSessionButton.textContent = "Export Session";
      exportSessionButton.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        exportSessionToFile(session);
      });
      sessionButtons.appendChild(exportSessionButton);

      contentContainer.appendChild(sessionButtons);

      // For each window, create a table for its details.
      session.windows.forEach((win, winIndex) => {
        const table = document.createElement("table");
        table.classList.add("session-details");

        // Table header: a single cell with window title and inline action buttons.
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        const headerCell = document.createElement("th");
        headerCell.colSpan = 3;
        headerCell.style.whiteSpace = "nowrap";

        // Create a header container with inline layout.
        const headerContainer = document.createElement("div");
        headerContainer.style.display = "flex";
        headerContainer.style.justifyContent = "flex-start"; // align left
        headerContainer.style.alignItems = "center";

        const windowTitleSpan = document.createElement("span");
        windowTitleSpan.textContent = `Window ${winIndex + 1} (${win.tabs.length} tab${win.tabs.length !== 1 ? "s" : ""})`;
        headerContainer.appendChild(windowTitleSpan);

        // Inline actions container.
        const actionsContainer = document.createElement("div");
        actionsContainer.style.display = "inline-flex";
        actionsContainer.style.gap = "4px";
        actionsContainer.style.marginLeft = "10px";

        const restoreWindowButton = document.createElement("button");
        restoreWindowButton.type = "button";
        restoreWindowButton.textContent = "Restore Window";
        restoreWindowButton.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          restoreWindow(session, winIndex);
        });
        actionsContainer.appendChild(restoreWindowButton);

        const deleteWindowButton = document.createElement("button");
        deleteWindowButton.type = "button";
        deleteWindowButton.textContent = "[x]";
        deleteWindowButton.classList.add("delete");
        deleteWindowButton.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          removeWindowFromSession(session.id, winIndex);
        });
        actionsContainer.appendChild(deleteWindowButton);

        headerContainer.appendChild(actionsContainer);
        headerCell.appendChild(headerContainer);
        headerRow.appendChild(headerCell);
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Table body: list each tab.
        const tbody = document.createElement("tbody");
        win.tabs.forEach((tab, tabIndex) => {
          const row = document.createElement("tr");

          const deleteCell = document.createElement("td");
          deleteCell.style.width = "30px";
          const deleteTabButton = document.createElement("button");
          deleteTabButton.type = "button";
          deleteTabButton.classList.add("delete");
          deleteTabButton.textContent = "[x]";
          deleteTabButton.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            removeTabFromSession(session.id, winIndex, tabIndex);
          });
          deleteCell.appendChild(deleteTabButton);
          row.appendChild(deleteCell);

          const urlCell = document.createElement("td");
          urlCell.colSpan = 2;
          urlCell.textContent = tab.url;
          row.appendChild(urlCell);

          tbody.appendChild(row);
        });
        table.appendChild(tbody);
        contentContainer.appendChild(table);
      });

      details.appendChild(contentContainer);
      sessionsContainer.appendChild(details);
    });

    sessionsContainer.scrollTop = scrollPos;
  });
}

// Restore an entire session.
function restoreSession(session) {
  session.windows.forEach(win => {
    if (win.tabs && win.tabs.length > 0) {
      const urls = win.tabs.map(tab => tab.url);
      chrome.windows.create({ url: urls[0] }, function (newWindow) {
        for (let i = 1; i < urls.length; i++) {
          chrome.tabs.create({ windowId: newWindow.id, url: urls[i] });
        }
      });
    }
  });
}

// Restore a specific window.
function restoreWindow(session, winIndex) {
  const win = session.windows[winIndex];
  if (win && win.tabs && win.tabs.length > 0) {
    const urls = win.tabs.map(tab => tab.url);
    chrome.windows.create({ url: urls[0] }, function (newWindow) {
      for (let i = 1; i < urls.length; i++) {
        chrome.tabs.create({ windowId: newWindow.id, url: urls[i] });
      }
    });
  }
}

// Remove a single tab. If its window becomes empty, remove the window.
function removeTabFromSession(sessionId, winIndex, tabIndex) {
  chrome.storage.local.get({ savedSessions: [] }, function (result) {
    let sessions = result.savedSessions;
    let session = sessions.find(s => s.id === sessionId);
    if (session && session.windows && session.windows[winIndex] && session.windows[winIndex].tabs) {
      session.windows[winIndex].tabs.splice(tabIndex, 1);
      if (session.windows[winIndex].tabs.length === 0) {
        session.windows.splice(winIndex, 1);
      }
      chrome.storage.local.set({ savedSessions: sessions }, function () {
        loadSessions();
      });
    }
  });
}

// Remove an entire window.
function removeWindowFromSession(sessionId, winIndex) {
  chrome.storage.local.get({ savedSessions: [] }, function (result) {
    let sessions = result.savedSessions;
    let session = sessions.find(s => s.id === sessionId);
    if (session && session.windows && session.windows[winIndex]) {
      session.windows.splice(winIndex, 1);
      chrome.storage.local.set({ savedSessions: sessions }, function () {
        loadSessions();
      });
    }
  });
}

// Remove an entire session.
function removeSessionFromStorage(sessionId) {
  chrome.storage.local.get({ savedSessions: [] }, function (result) {
    let sessions = result.savedSessions;
    sessions = sessions.filter(s => s.id !== sessionId);
    chrome.storage.local.set({ savedSessions: sessions }, function () {
      loadSessions();
    });
  });
}

// Export a session to a JSON file.
function exportSessionToFile(session) {
  const exportData = {
    id: session.id,
    timestamp: session.timestamp,
    date: session.date,
    windows: session.windows.map(win => ({
      tabs: win.tabs.map(tab => ({ url: getRealUrl(tab.url) }))
    }))
  };
  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeTimestamp = session.timestamp.replace(/[\s:]/g, "-");
  a.download = `session-${safeTimestamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import sessions from JSON.
function importSessions() {
  let importText = document.getElementById("importTextarea").value;
  try {
    let importedSessions = JSON.parse(importText);
    chrome.storage.local.get({ savedSessions: [] }, function (result) {
      let sessions = result.savedSessions;
      sessions = sessions.concat(importedSessions);
      chrome.storage.local.set({ savedSessions: sessions }, function () {
        loadSessions();
        alert("Import successful");
      });
    });
  } catch (e) {
    alert("Error importing sessions: " + e.message);
  }
}
