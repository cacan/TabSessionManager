# 🗂️ Tab Session Manager

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue?style=for-the-badge&logo=google-chrome)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.2-orange?style=for-the-badge)

> **Never lose your tabs again.** A powerful, efficient, and privacy-focused Chrome Extension that automatically saves your browser sessions, ensuring you can always pick up where you left off.

---

## 📖 Overview

**Tab Session Manager** is designed for power users who juggle multiple projects and hundreds of tabs. It works silently in the background, capturing the state of your windows and tabs whenever you open a new one. With its **Smart Purging** algorithm, it maintains a detailed history of your recent work while automatically summarizing older sessions to save space—without you lifting a finger.

## ✨ Key Features

### 🔄 Automatic & Intelligent Saving
*   **Auto-Save**: Triggers automatically whenever a new tab or window is created.
*   **Manual Save**: One-click manual save button for peace of mind before closing a window.
*   **Performance**: Optimized to handle hundreds of tabs with zero lag.

### 🧹 Smart History Management
Our intelligent retention policy ensures you have the data you need without the clutter:
*   **Today**: Keeps **100%** of all recorded sessions.
*   **Current Month**: Retains the **latest session of each day** for past days.
*   **Previous Months**: Retains the **latest session of each month** for historical archiving.

### 🛠️ Granular Control
*   **Full Restore**: Open an entire session (all windows and tabs) in one go.
*   **Window Restore**: Restore just a specific window from a past session.
*   **Tab Restore**: Cherry-pick individual tabs to reopen.
*   **Search & Filter**: (Coming Soon)

### 💾 Data Portability & Storage
*   **Unlimited Storage**: Uses the `unlimitedStorage` permission to store as much history as your disk allows.
*   **Export to JSON**: Backup your sessions to a file.
*   **Import from JSON**: Restore your history on a new machine.

---

## 🚀 Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/tab-session-manager.git
    ```

2.  **Open Chrome Extensions**
    *   Navigate to `chrome://extensions/` in your address bar.
    *   Toggle **Developer mode** in the top right corner.

3.  **Load the Extension**
    *   Click **Load unpacked**.
    *   Select the directory where you cloned/downloaded this project.

4.  **Pin & Enjoy**
    *   Pin the extension icon to your toolbar for easy access!

---

## 🕹️ Usage Guide

### The Popup Interface
Clicking the extension icon opens the main dashboard:

| Action | Description |
| :--- | :--- |
| **Save Current Session** | Immediately saves the state of all currently open windows and tabs. |
| **Expand Session** | Click the `►` arrow (or the header) to view the windows and tabs within a session. |
| **Restore Session** | Click **"Restore Session"** to open all windows and tabs from that snapshot. |
| **Delete** | Use the `[x]` buttons to remove a specific tab, window, or the entire session. |

### Importing & Exporting
*   **Export**: Expand a session and click **"Export Session"**. A `.json` file will be downloaded.
*   **Import**: Scroll to the bottom of the popup, paste the content of your JSON file into the text area, and click **"Import Sessions"**.

---

## 🏗️ Technical Details

*   **Framework**: Native Chrome Extension API (Manifest V3).
*   **Storage**: `chrome.storage.local` with `unlimitedStorage`.
*   **Background Worker**: Service worker-based background script for persistent event listening.

### File Structure
```
/
├── manifest.json      # Extension configuration
├── background.js      # Core logic (Auto-save, Purging)
├── popup.html         # UI Layout
├── popup.js           # UI Logic & Interaction
└── icons/             # Extension icons (if applicable)
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
