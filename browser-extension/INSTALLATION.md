# SwipeJob Auto-Fill Extension - Installation Guide

## Quick Install (5 Minutes)

### Step 1: Prepare Extension Files

You already have the extension! It's in the `browser-extension` folder.

### Step 2: Create Icons

The extension needs 3 icon files. Choose one method:

#### Method A: Download Icons (Easiest)

1. Go to https://www.flaticon.com
2. Search for "application" or "form"
3. Download in PNG format
4. Resize to 16x16, 48x48, and 128x128 pixels
5. Save as:
   - `browser-extension/icons/icon16.png`
   - `browser-extension/icons/icon48.png`
   - `browser-extension/icons/icon128.png`

#### Method B: Use Simple Placeholders

Create simple colored squares:

```bash
cd browser-extension/icons

# Create simple green icons (requires ImageMagick)
convert -size 16x16 xc:"#10b981" icon16.png
convert -size 48x48 xc:"#10b981" icon48.png
convert -size 128x128 xc:"#10b981" icon128.png
```

#### Method C: Use Online Tool

1. Visit https://www.favicon-generator.org/
2. Upload any image (logo, screenshot, etc.)
3. Download the generated icons
4. Rename and place in `browser-extension/icons/`

### Step 3: Load Extension in Chrome

1. **Open Chrome Extensions Page:**
   - Type in address bar: `chrome://extensions/`
   - Or: Menu (⋮) → Extensions → Manage Extensions

2. **Enable Developer Mode:**
   - Toggle switch in top-right corner

3. **Load Extension:**
   - Click "Load unpacked" button
   - Navigate to and select `browser-extension` folder
   - Click "Select Folder"

4. **Verify Installation:**
   - Extension appears in list
   - Toggle is ON (blue)
   - No errors shown

5. **Pin to Toolbar (Optional but Recommended):**
   - Click puzzle piece icon in Chrome toolbar
   - Find "SwipeJob Auto-Fill Assistant"
   - Click pin icon

### Step 4: Sync Your Profile

1. **Click extension icon** in Chrome toolbar

2. **Click "Sync Profile from SwipeJob"**

3. **You'll be taken to:** `http://localhost:5000/extension-sync`

4. **Log in if needed**, then click "Sync Now"

5. **Extension popup shows:** "✅ Synced as [Your Name]"

### Step 5: Test It!

1. **Visit a job application page:**
   - Try: https://www.pnet.co.za (any job listing)
   - Or: https://www.indeed.co.za
   - Or: https://www.careers24.com

2. **Extension auto-fills forms** within 1-2 seconds

3. **Look for green highlights** on filled fields

4. **Review and submit!**

---

## Troubleshooting

### "Error loading extension"

**Check folder structure:**
```
browser-extension/
├── manifest.json          ← Must exist
├── popup.html            ← Must exist
├── icons/
│   ├── icon16.png       ← Must exist
│   ├── icon48.png       ← Must exist
│   └── icon128.png      ← Must exist
├── scripts/
│   ├── background.js
│   ├── content.js
│   └── popup.js
└── styles/
    └── content.css
```

**Solution:**
- Make sure all files exist
- Check that icons are actually .png files
- Click "Reload" button on extension

### Extension loads but icon is missing

**Create placeholder icons:**
```bash
cd browser-extension/icons
# Any 16x16 image will work
cp /path/to/any/small/image.png icon16.png
cp /path/to/any/medium/image.png icon48.png
cp /path/to/any/large/image.png icon128.png
```

### "Manifest version not supported"

**You need Chrome 88+** (Edge 88+)
- Update your browser
- Or use the legacy manifest v2 (not recommended)

### Extension installed but not syncing

1. **Check if logged into SwipeJob:**
   - Open `http://localhost:5000` in another tab
   - Log in to your account

2. **Try manual sync:**
   - Go to `http://localhost:5000/extension-sync`
   - Click "Sync Now"

3. **Check extension permissions:**
   - Go to `chrome://extensions/`
   - Click "Details" on SwipeJob extension
   - Make sure all permissions are granted

### Forms not auto-filling

1. **Check sync status:**
   - Click extension icon
   - Should show "✅ Synced as [name]"
   - If not, re-sync

2. **Reload the page:**
   - Some sites need a refresh
   - Press F5 or Ctrl+R

3. **Try manual fill:**
   - Click extension icon
   - Click "Fill Forms on This Page"

4. **Check if site is supported:**
   - Extension works on most sites
   - Some custom forms may not auto-fill

---

## Updating the Extension

When you make changes:

1. **Edit files** in `browser-extension/`

2. **Go to** `chrome://extensions/`

3. **Click reload icon** (circular arrow) on SwipeJob extension

4. **Test changes** on a job application page

---

## Uninstalling

1. Go to `chrome://extensions/`
2. Find "SwipeJob Auto-Fill Assistant"
3. Click "Remove"
4. Confirm removal
5. All data deleted automatically

---

## For Developers

### Project Structure

```
browser-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── icons/                # Extension icons
├── scripts/
│   ├── background.js     # Background service worker
│   ├── content.js        # Injected into job pages
│   └── popup.js          # Popup interaction logic
├── styles/
│   └── content.css       # Visual feedback styles
└── README.md             # Documentation
```

### Key Files

**manifest.json:**
- Defines permissions
- Lists content script matches
- Sets up background worker

**content.js:**
- Runs on job application pages
- Detects and fills form fields
- Shows visual feedback

**background.js:**
- Manages data storage
- Tracks statistics
- Handles cross-tab communication

**popup.js:**
- User interface logic
- Sync functionality
- Statistics display

### Testing

```bash
# Open developer tools for content script
F12 on any job page → Console → Filter "SwipeJob"

# Open developer tools for popup
Right-click extension icon → Inspect popup

# View background worker logs
chrome://extensions/ → SwipeJob → Inspect views: service worker
```

### Debugging Common Issues

**Check if content script loaded:**
```javascript
// In page console (F12)
console.log('Content script loaded:', !!window.swipeJobContentLoaded);
```

**Check user data:**
```javascript
// In extension popup console
chrome.storage.local.get(['swipeJobUserData'], (result) => {
  console.log('User data:', result.swipeJobUserData);
});
```

**Check what fields were detected:**
```javascript
// In page console after auto-fill
document.querySelectorAll('.swipejob-filled').forEach(field => {
  console.log('Filled:', field.name, field.value);
});
```

---

## Production Deployment

To publish to Chrome Web Store:

1. **Prepare assets:**
   - Professional icons (128x128 minimum)
   - Screenshots (1280x800 or 640x400)
   - Promotional images

2. **Create developer account:**
   - https://chrome.google.com/webstore/devconsole
   - One-time $5 fee

3. **Package extension:**
   ```bash
   cd browser-extension
   zip -r swipejob-extension.zip *
   ```

4. **Upload to Web Store:**
   - Fill in listing details
   - Set price (free)
   - Upload zip file
   - Submit for review

5. **Review time:** 1-3 days typically

---

## Support

Questions? Check:
1. Main README.md file
2. SwipeJob documentation
3. Email: support@swipejob.co.za

---

**Happy Auto-Filling!** 🚀
