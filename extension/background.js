// Background service worker for Chrome Extension
// Handles installation and background tasks

chrome.runtime.onInstalled.addListener(() => {
  console.log('Job Match Analyzer installed successfully!');
  
  // Set default storage values if needed
  chrome.storage.local.get(['resumeText'], (result) => {
    if (!result.resumeText) {
      console.log('No resume stored yet');
    }
  });
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'storeResume') {
    chrome.storage.local.set({ resumeText: request.resumeText }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'getResume') {
    chrome.storage.local.get(['resumeText'], (result) => {
      sendResponse({ resumeText: result.resumeText });
    });
    return true;
  }
});
