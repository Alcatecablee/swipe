// SwipeJob Auto-Fill - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // Load user data and stats
  await loadStatus();
  await loadStats();
  
  // Set up event listeners
  document.getElementById('sync-button').addEventListener('click', syncProfile);
  document.getElementById('fill-button').addEventListener('click', fillCurrentPage);
  document.getElementById('help-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({
      url: 'https://swipejob.co.za/extension-help'
    });
  });
});

// Load sync status
async function loadStatus() {
  try {
    const result = await chrome.storage.local.get(['swipeJobUserData']);
    const statusDiv = document.getElementById('status');
    const fillButton = document.getElementById('fill-button');
    
    if (result.swipeJobUserData && result.swipeJobUserData.email) {
      statusDiv.className = 'status status--synced';
      statusDiv.innerHTML = `
        <div class="status-icon">✅</div>
        <div class="status-text">
          Synced as ${result.swipeJobUserData.name || result.swipeJobUserData.email}
        </div>
      `;
      fillButton.disabled = false;
    } else {
      statusDiv.className = 'status status--not-synced';
      statusDiv.innerHTML = `
        <div class="status-icon">⚠️</div>
        <div class="status-text">Not synced. Click "Sync Profile" below.</div>
      `;
      fillButton.disabled = true;
    }
  } catch (error) {
    console.error('Error loading status:', error);
  }
}

// Load statistics
async function loadStats() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
    
    if (response && response.stats) {
      const stats = response.stats;
      document.getElementById('stat-applications').textContent = stats.applicationsHelped || 0;
      document.getElementById('stat-fields').textContent = stats.fieldsFilledTotal || 0;
      document.getElementById('stat-time').textContent = Math.floor((stats.timesSaved || 0) / 60);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Sync profile from SwipeJob
async function syncProfile() {
  const button = document.getElementById('sync-button');
  const originalText = button.textContent;
  
  try {
    // Show loading state
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span> Syncing...';
    
    // Open SwipeJob in new tab to get user data
    // The user will need to be logged in to SwipeJob
    const swipeJobUrl = 'http://localhost:5000/extension-sync'; // Will update this
    
    // For MVP, we'll use a simpler approach:
    // Open a page that lets user copy their profile data
    const tabs = await chrome.tabs.query({ url: '*://localhost:5000/*' });
    
    if (tabs.length > 0) {
      // SwipeJob is already open, activate that tab
      await chrome.tabs.update(tabs[0].id, { active: true });
      await chrome.windows.update(tabs[0].windowId, { focused: true });
      
      // Try to get data from the page
      try {
        const response = await chrome.tabs.sendMessage(tabs[0].id, {
          type: 'GET_USER_DATA'
        });
        
        if (response && response.userData) {
          await saveUserData(response.userData);
          button.textContent = '✅ Synced!';
          setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            loadStatus();
          }, 2000);
          return;
        }
      } catch (error) {
        console.log('Could not get data from page, opening sync page...');
      }
    }
    
    // Open sync page
    chrome.tabs.create({
      url: swipeJobUrl,
      active: true,
    });
    
    // Listen for sync completion
    const listener = (message) => {
      if (message.type === 'SYNC_COMPLETE') {
        saveUserData(message.userData);
        button.textContent = '✅ Synced!';
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
          loadStatus();
        }, 2000);
        chrome.runtime.onMessage.removeListener(listener);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    
    // Reset button after 3 seconds if no response
    setTimeout(() => {
      if (button.textContent.includes('Syncing')) {
        button.textContent = originalText;
        button.disabled = false;
      }
    }, 3000);
    
  } catch (error) {
    console.error('Error syncing profile:', error);
    button.textContent = '❌ Sync failed';
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  }
}

// Save user data to storage
async function saveUserData(userData) {
  try {
    await chrome.storage.local.set({ swipeJobUserData: userData });
    await chrome.runtime.sendMessage({
      type: 'SYNC_USER_DATA',
      data: userData,
    });
    console.log('User data saved:', userData);
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

// Fill forms on current page
async function fillCurrentPage() {
  const button = document.getElementById('fill-button');
  const originalText = button.textContent;
  
  try {
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span> Filling...';
    
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to content script
    await chrome.tabs.sendMessage(tab.id, { type: 'FILL_FORMS' });
    
    button.textContent = '✅ Filled!';
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
    
  } catch (error) {
    console.error('Error filling forms:', error);
    button.textContent = '❌ Fill failed';
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  }
}
