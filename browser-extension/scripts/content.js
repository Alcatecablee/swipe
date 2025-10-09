// SwipeJob Auto-Fill Content Script
// This script runs on job application pages and auto-fills forms

console.log('SwipeJob Auto-Fill: Content script loaded');

// Field mapping configurations for different form patterns
const FIELD_PATTERNS = {
  name: [
    'input[name*="name"]:not([name*="user"]):not([name*="company"])',
    'input[id*="name"]:not([id*="user"]):not([id*="company"])',
    'input[placeholder*="name" i]:not([placeholder*="company" i])',
    'input[aria-label*="name" i]',
    'input[autocomplete="name"]',
  ],
  firstName: [
    'input[name*="first" i][name*="name" i]',
    'input[id*="first" i][id*="name" i]',
    'input[placeholder*="first name" i]',
    'input[autocomplete="given-name"]',
  ],
  lastName: [
    'input[name*="last" i][name*="name" i]',
    'input[id*="last" i][id*="name" i]',
    'input[placeholder*="last name" i]',
    'input[autocomplete="family-name"]',
  ],
  email: [
    'input[type="email"]',
    'input[name*="email" i]',
    'input[id*="email" i]',
    'input[placeholder*="email" i]',
    'input[autocomplete="email"]',
  ],
  phone: [
    'input[type="tel"]',
    'input[name*="phone" i]',
    'input[name*="mobile" i]',
    'input[name*="contact" i]',
    'input[id*="phone" i]',
    'input[placeholder*="phone" i]',
    'input[autocomplete="tel"]',
  ],
  location: [
    'input[name*="city" i]',
    'input[name*="location" i]',
    'input[name*="address" i]',
    'input[id*="city" i]',
    'input[placeholder*="city" i]',
    'input[placeholder*="location" i]',
  ],
  coverLetter: [
    'textarea[name*="cover" i]',
    'textarea[name*="letter" i]',
    'textarea[id*="cover" i]',
    'textarea[placeholder*="cover letter" i]',
    'textarea[placeholder*="why" i]',
  ],
  linkedin: [
    'input[name*="linkedin" i]',
    'input[id*="linkedin" i]',
    'input[placeholder*="linkedin" i]',
  ],
  portfolio: [
    'input[name*="portfolio" i]',
    'input[name*="website" i]',
    'input[id*="portfolio" i]',
    'input[placeholder*="portfolio" i]',
  ],
};

// State management
let userData = null;
let filledFields = new Set();

// Initialize extension
async function initialize() {
  try {
    // Get user data from storage
    const result = await chrome.storage.local.get(['swipeJobUserData']);
    
    if (result.swipeJobUserData) {
      userData = result.swipeJobUserData;
      console.log('SwipeJob: User data loaded', userData);
      
      // Show notification
      showNotification('SwipeJob Auto-Fill is ready!', 'info');
      
      // Auto-fill forms after a short delay
      setTimeout(autoFillForms, 1000);
      
      // Watch for dynamic forms (SPAs)
      observeFormChanges();
    } else {
      console.log('SwipeJob: No user data found. Please open the extension popup to sync your data.');
      showNotification('Click the SwipeJob extension icon to sync your profile', 'warning');
    }
  } catch (error) {
    console.error('SwipeJob: Error initializing:', error);
  }
}

// Find form field using multiple patterns
function findField(patterns) {
  for (const pattern of patterns) {
    const field = document.querySelector(pattern);
    if (field && !field.disabled && !field.readOnly) {
      return field;
    }
  }
  return null;
}

// Fill a form field with value
function fillField(field, value, fieldType) {
  if (!field || !value || filledFields.has(field)) return false;
  
  try {
    // Set value
    field.value = value;
    
    // Trigger events for frameworks (React, Vue, etc.)
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new Event('blur', { bubbles: true }));
    
    // Visual feedback
    field.classList.add('swipejob-filled');
    filledFields.add(field);
    
    console.log(`SwipeJob: Filled ${fieldType}:`, value);
    return true;
  } catch (error) {
    console.error(`SwipeJob: Error filling ${fieldType}:`, error);
    return false;
  }
}

// Main auto-fill function
function autoFillForms() {
  if (!userData) return;
  
  let fieldsFilledCount = 0;
  
  // Fill name fields
  const nameField = findField(FIELD_PATTERNS.name);
  const firstNameField = findField(FIELD_PATTERNS.firstName);
  const lastNameField = findField(FIELD_PATTERNS.lastName);
  
  if (userData.name) {
    if (firstNameField && lastNameField) {
      // Split name for first/last name fields
      const nameParts = userData.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];
      
      if (fillField(firstNameField, firstName, 'firstName')) fieldsFilledCount++;
      if (fillField(lastNameField, lastName, 'lastName')) fieldsFilledCount++;
    } else if (nameField) {
      // Use full name field
      if (fillField(nameField, userData.name, 'name')) fieldsFilledCount++;
    }
  }
  
  // Fill email
  const emailField = findField(FIELD_PATTERNS.email);
  if (emailField && userData.email) {
    if (fillField(emailField, userData.email, 'email')) fieldsFilledCount++;
  }
  
  // Fill phone
  const phoneField = findField(FIELD_PATTERNS.phone);
  if (phoneField && userData.phone) {
    if (fillField(phoneField, userData.phone, 'phone')) fieldsFilledCount++;
  }
  
  // Fill location
  const locationField = findField(FIELD_PATTERNS.location);
  if (locationField && userData.location) {
    if (fillField(locationField, userData.location, 'location')) fieldsFilledCount++;
  }
  
  // Fill cover letter
  const coverLetterField = findField(FIELD_PATTERNS.coverLetter);
  if (coverLetterField && userData.coverLetter) {
    if (fillField(coverLetterField, userData.coverLetter, 'coverLetter')) fieldsFilledCount++;
  }
  
  // Fill LinkedIn
  const linkedinField = findField(FIELD_PATTERNS.linkedin);
  if (linkedinField && userData.linkedin) {
    if (fillField(linkedinField, userData.linkedin, 'linkedin')) fieldsFilledCount++;
  }
  
  // Fill portfolio/website
  const portfolioField = findField(FIELD_PATTERNS.portfolio);
  if (portfolioField && userData.portfolio) {
    if (fillField(portfolioField, userData.portfolio, 'portfolio')) fieldsFilledCount++;
  }
  
  // Show success notification
  if (fieldsFilledCount > 0) {
    showNotification(
      `Auto-filled ${fieldsFilledCount} field${fieldsFilledCount > 1 ? 's' : ''}! Review and submit.`,
      'success'
    );
    
    // Send analytics
    chrome.runtime.sendMessage({
      type: 'FIELDS_FILLED',
      count: fieldsFilledCount,
      url: window.location.href,
    });
  }
}

// Observe DOM changes for dynamic forms (SPAs)
function observeFormChanges() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        // Check if new form elements were added
        const hasFormElements = Array.from(mutation.addedNodes).some(node => 
          node.nodeType === 1 && (node.tagName === 'FORM' || node.querySelector('form'))
        );
        
        if (hasFormElements) {
          console.log('SwipeJob: New form detected, auto-filling...');
          setTimeout(autoFillForms, 500);
        }
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Show notification overlay
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existing = document.querySelector('.swipejob-notification');
  if (existing) existing.remove();
  
  // Create notification
  const notification = document.createElement('div');
  notification.className = `swipejob-notification swipejob-notification--${type}`;
  notification.innerHTML = `
    <div class="swipejob-notification__icon">
      ${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'}
    </div>
    <div class="swipejob-notification__message">${message}</div>
    <button class="swipejob-notification__close">×</button>
  `;
  
  document.body.appendChild(notification);
  
  // Close button
  notification.querySelector('.swipejob-notification__close').addEventListener('click', () => {
    notification.remove();
  });
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.classList.add('swipejob-notification--fade-out');
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('SwipeJob: Received message:', message);
  
  switch (message.type) {
    case 'UPDATE_USER_DATA':
      userData = message.data;
      chrome.storage.local.set({ swipeJobUserData: userData });
      autoFillForms();
      showNotification('Profile updated! Forms will be auto-filled.', 'success');
      sendResponse({ success: true });
      break;
      
    case 'FILL_FORMS':
      autoFillForms();
      sendResponse({ success: true });
      break;
      
    case 'GET_FILLED_COUNT':
      sendResponse({ count: filledFields.size });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
  
  return true; // Keep channel open for async response
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Re-initialize on page navigation (for SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log('SwipeJob: URL changed, re-initializing...');
    filledFields.clear();
    setTimeout(initialize, 1000);
  }
}).observe(document, { subtree: true, childList: true });
