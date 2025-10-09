// SwipeJob Auto-Fill - Background Service Worker

console.log('SwipeJob Auto-Fill: Background service worker started');

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('SwipeJob: Extension installed/updated', details);
  
  if (details.reason === 'install') {
    // First time installation
    chrome.storage.local.set({
      installDate: new Date().toISOString(),
      stats: {
        fieldsFilledTotal: 0,
        applicationsHelped: 0,
        timesSaved: 0,
      }
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: 'https://swipejob.co.za/extension-installed',
    });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('SwipeJob Background: Received message:', message);
  
  switch (message.type) {
    case 'FIELDS_FILLED':
      handleFieldsFilled(message);
      sendResponse({ success: true });
      break;
      
    case 'GET_STATS':
      getStats().then(stats => sendResponse({ stats }));
      return true; // Keep channel open
      
    case 'SYNC_USER_DATA':
      syncUserData(message.data).then(() => {
        sendResponse({ success: true });
      });
      return true;
      
    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// Handle fields filled event
async function handleFieldsFilled(message) {
  try {
    const result = await chrome.storage.local.get(['stats']);
    const stats = result.stats || {
      fieldsFilledTotal: 0,
      applicationsHelped: 0,
      timesSaved: 0,
    };
    
    // Update stats
    stats.fieldsFilledTotal += message.count;
    stats.applicationsHelped += 1;
    stats.timesSaved += message.count * 30; // Assume 30 seconds per field
    
    await chrome.storage.local.set({ stats });
    
    // Update badge
    chrome.action.setBadgeText({
      text: stats.applicationsHelped.toString(),
    });
    chrome.action.setBadgeBackgroundColor({
      color: '#10b981',
    });
    
    console.log('SwipeJob: Stats updated', stats);
  } catch (error) {
    console.error('SwipeJob: Error updating stats:', error);
  }
}

// Get stats
async function getStats() {
  const result = await chrome.storage.local.get(['stats', 'installDate']);
  return {
    ...result.stats,
    installDate: result.installDate,
  };
}

// Sync user data from main app
async function syncUserData(data) {
  try {
    await chrome.storage.local.set({ swipeJobUserData: data });
    console.log('SwipeJob: User data synced', data);
    
    // Notify all tabs
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'UPDATE_USER_DATA',
          data: data,
        });
      } catch (error) {
        // Tab may not have content script, ignore
      }
    }
  } catch (error) {
    console.error('SwipeJob: Error syncing user data:', error);
  }
}

// Listen for tab updates to detect job application pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = tab.url.toLowerCase();
    
    // Check if it's a job application page
    const isJobPage = 
      url.includes('apply') ||
      url.includes('application') ||
      url.includes('job') ||
      url.includes('career');
    
    if (isJobPage) {
      console.log('SwipeJob: Job application page detected:', tab.url);
      
      // Show page action
      chrome.action.setIcon({
        tabId: tabId,
        path: {
          '16': 'icons/icon16.png',
          '48': 'icons/icon48.png',
          '128': 'icons/icon128.png',
        }
      });
    }
  }
});

// Handle context menu (optional - for manual fill)
chrome.contextMenus.create({
  id: 'swipejob-fill',
  title: 'Fill form with SwipeJob data',
  contexts: ['editable'],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'swipejob-fill') {
    chrome.tabs.sendMessage(tab.id, { type: 'FILL_FORMS' });
  }
});
