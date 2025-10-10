# SwipeJob Auto-Fill Browser Extension

**Automatically fill job application forms with your SwipeJob profile data.**

Save 10+ minutes per application. Works with Pnet, Careers24, Indeed, LinkedIn, and 1000+ job sites.

---

## Features

✅ **Auto-Fill Forms** - Automatically detects and fills name, email, phone, location  
✅ **Cover Letter Paste** - Inserts your AI-generated cover letter  
✅ **Visual Feedback** - Green highlights show filled fields  
✅ **Works Everywhere** - Pnet, Careers24, Indeed, LinkedIn, Greenhouse, Lever, Workday, etc.  
✅ **Privacy First** - All data stored locally, no tracking  
✅ **Statistics** - Track applications helped and time saved  

---

## Installation (5 Minutes)

### Step 1: Load Extension in Chrome/Edge

1. **Download/Clone** this `browser-extension` folder

2. **Open Chrome Extensions:**
   - Go to `chrome://extensions/`
   - Or Menu → Extensions → Manage Extensions

3. **Enable Developer Mode:**
   - Toggle "Developer mode" in top-right corner

4. **Load Extension:**
   - Click "Load unpacked"
   - Select the `browser-extension` folder
   - Extension icon appears in toolbar

5. **Pin Extension (Optional):**
   - Click puzzle icon in toolbar
   - Pin SwipeJob Auto-Fill

### Step 2: Create Icons (First Time Setup)

The extension needs 3 icon files. Create simple placeholder icons:

```bash
# Navigate to icons folder
cd browser-extension/icons

# Create 16x16 icon (you can use any image editor or online tool)
# Or download from: https://www.flaticon.com (search "application form")
# Save as: icon16.png, icon48.png, icon128.png
```

Or use this quick script to create basic icons:

```bash
# Install ImageMagick (if not installed)
# brew install imagemagick (Mac)
# sudo apt install imagemagick (Linux)

# Create simple green circle icons
convert -size 16x16 xc:none -fill "#10b981" -draw "circle 8,8 8,1" icon16.png
convert -size 48x48 xc:none -fill "#10b981" -draw "circle 24,24 24,3" icon48.png
convert -size 128x128 xc:none -fill "#10b981" -draw "circle 64,64 64,8" icon128.png
```

### Step 3: Sync Your Profile

1. **Click extension icon** in Chrome toolbar

2. **Click "Sync Profile from SwipeJob"**

3. **You'll be redirected to SwipeJob** (localhost:5000/extension-sync)

4. **Log in to your SwipeJob account**

5. **Profile syncs automatically**

6. **Extension shows "✅ Synced"**

---

## How to Use

### Method 1: Automatic (Recommended)

1. **Be logged into SwipeJob** and have extension installed

2. **Swipe right on any job** in SwipeJob app

3. **Job opens in new tab** with your data pre-filled

4. **Review and click Submit** - done!

### Method 2: Manual

1. **Visit any job application page** (Pnet, Indeed, etc.)

2. **Extension auto-fills forms** within 1-2 seconds

3. **Green highlights** show filled fields

4. **Review and submit**

### Method 3: Manual Trigger

1. **On any application page**, click extension icon

2. **Click "Fill Forms on This Page"**

3. **Forms auto-fill instantly**

---

## What Gets Auto-Filled

✅ **Name** (full name or first/last)  
✅ **Email address**  
✅ **Phone number**  
✅ **Location** (city)  
✅ **Cover letter** (AI-generated from SwipeJob)  
✅ **LinkedIn profile** (if in your SwipeJob profile)  
✅ **Portfolio/website** (if in your SwipeJob profile)  

**Resume upload:** You'll need to manually select your resume file (browser security)

---

## Supported Websites

The extension works on 1000+ job sites including:

### South African Sites:
- ✅ Pnet.co.za
- ✅ Careers24.com
- ✅ Indeed.co.za
- ✅ JobMail.co.za
- ✅ Gumtree.co.za
- ✅ CareerJet.co.za
- ✅ JobJack.co.za
- ✅ BizCommunity.com

### International Sites:
- ✅ LinkedIn.com
- ✅ Indeed.com (global)
- ✅ Greenhouse.io (ATS)
- ✅ Lever.co (ATS)
- ✅ Workday.com (ATS)
- ✅ SmartRecruiters.com
- ✅ Breezy.hr

**Plus any other job application form with standard fields!**

---

## Troubleshooting

### Extension not filling forms

**Check if synced:**
- Click extension icon
- Should show "✅ Synced as [your name]"
- If not, click "Sync Profile from SwipeJob"

**Check if form is supported:**
- Extension looks for common field names (name, email, phone, etc.)
- Some custom forms may not auto-fill
- Use "Fill Forms on This Page" button manually

**Reload the page:**
- Some SPAs (Single Page Apps) need a refresh
- Press F5 or Ctrl+R

### Forms partially filled

**This is normal!**
- Extension fills common fields only
- You'll still need to:
  - Upload resume file (security restriction)
  - Answer custom questions
  - Select dropdowns (location, work type, etc.)

**What to do:**
- Review all fields
- Fill remaining fields manually
- Should still save 70-80% of time

### Extension not syncing

**Make sure you're logged into SwipeJob:**
- Open SwipeJob in another tab
- Log in if needed
- Try syncing again

**Manual sync:**
1. Go to SwipeJob → Profile
2. Copy your details
3. Open extension → manual entry (future feature)

### Filled data incorrect

**Update your SwipeJob profile:**
- Extension uses data from SwipeJob
- Update your profile there
- Re-sync extension

**Or edit directly in forms:**
- Just type over the auto-filled data
- Next sync will use updated info

---

## Privacy & Security

### What We Store:
- ✅ Your name, email, phone (locally in browser)
- ✅ Your cover letter template (locally)
- ✅ Statistics (applications helped, fields filled)

### What We DON'T Store:
- ❌ Your passwords
- ❌ Resume files (handled by browser)
- ❌ Your browsing history
- ❌ Data sent to external servers

### Where Data is Stored:
- **Locally in your browser** (Chrome storage API)
- **Never sent to our servers** (except during sync from SwipeJob)
- **You can clear anytime** (remove extension = data deleted)

---

## Statistics

Click extension icon to see:
- **Applications:** How many forms you've filled
- **Fields Filled:** Total fields auto-filled
- **Time Saved:** Estimated minutes saved

Example after 10 applications:
```
Applications: 10
Fields Filled: 87
Minutes Saved: 43
```

---

## Uninstall

If you want to remove the extension:

1. Go to `chrome://extensions/`
2. Find "SwipeJob Auto-Fill"
3. Click "Remove"
4. All data deleted automatically

---

## Development

### Testing Locally

```bash
# Make changes to extension files
# Go to chrome://extensions/
# Click "Reload" button on SwipeJob extension
# Test on a job application page
```

### Debugging

**View extension logs:**
```
Right-click extension icon → Inspect popup
Console tab → See popup.js logs

Or:

On job application page:
F12 → Console → Filter "SwipeJob"
```

**Common debug messages:**
```
SwipeJob: User data loaded
SwipeJob: Filled email: user@example.com
SwipeJob: Filled 5 fields
```

### Adding New Field Patterns

Edit `scripts/content.js`:

```javascript
const FIELD_PATTERNS = {
  newField: [
    'input[name*="newfield"]',
    'input[id*="newfield"]',
  ],
};

// Then in autoFillForms():
const newField = findField(FIELD_PATTERNS.newField);
if (newField && userData.newField) {
  fillField(newField, userData.newField, 'newField');
}
```

---

## Roadmap

### v1.0 (Current - MVP)
- ✅ Auto-fill common fields
- ✅ Visual feedback
- ✅ Statistics tracking
- ✅ Manual sync

### v1.1 (Next)
- 🔨 Auto-sync (no button click needed)
- 🔨 Resume file helper
- 🔨 Dropdown auto-select
- 🔨 Custom question AI answers

### v1.2 (Future)
- 🔨 One-click submit (optional)
- 🔨 Application tracking sync
- 🔨 A/B test different cover letters
- 🔨 Browser action shortcuts

### v2.0 (Advanced)
- 🔨 CAPTCHA detection & notification
- 🔨 Multi-page form navigation
- 🔨 Form validation checking
- 🔨 Screenshot capture for tracking

---

## Support

### Need Help?

1. **Check this README** - Most issues covered above
2. **Check extension console** - F12 → Console → Look for errors
3. **Contact support** - support@swipejob.co.za

### Report Bugs

When reporting issues, include:
- Browser version (Chrome/Edge)
- Website where it failed
- Error messages from console
- Steps to reproduce

---

## License

MIT License - Free to use and modify

---

## Contributing

Want to improve the extension?

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit pull request

---

**Built with ❤️ for South African job seekers**

SwipeJob - Apply faster, get hired sooner.
