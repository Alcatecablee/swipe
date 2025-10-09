#!/bin/bash

# SwipeJob Extension - Icon Creator Script
# Creates simple placeholder icons for the browser extension

echo "🎨 Creating SwipeJob Extension Icons..."

cd "$(dirname "$0")/icons" || exit 1

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found!"
    echo ""
    echo "Please install ImageMagick:"
    echo "  • Mac: brew install imagemagick"
    echo "  • Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  • Windows: Download from https://imagemagick.org/script/download.php"
    echo ""
    echo "Or manually create 3 PNG files (16x16, 48x48, 128x128) and place them in browser-extension/icons/"
    exit 1
fi

# SwipeJob brand color (green)
COLOR="#10b981"

# Create 16x16 icon (toolbar)
echo "Creating icon16.png..."
convert -size 16x16 xc:none \
    -fill "$COLOR" -draw "roundrectangle 0,0 16,16 3,3" \
    -fill white -pointsize 10 -gravity center -annotate +0+0 "S" \
    icon16.png

# Create 48x48 icon (extension management)
echo "Creating icon48.png..."
convert -size 48x48 xc:none \
    -fill "$COLOR" -draw "roundrectangle 0,0 48,48 8,8" \
    -fill white -pointsize 28 -gravity center -annotate +0+0 "SJ" \
    icon48.png

# Create 128x128 icon (chrome web store)
echo "Creating icon128.png..."
convert -size 128x128 xc:none \
    -fill "$COLOR" -draw "roundrectangle 0,0 128,128 20,20" \
    -fill white -pointsize 60 -gravity center -annotate +0+0 "SJ" \
    icon128.png

echo ""
echo "✅ Icons created successfully!"
echo "   📁 Location: browser-extension/icons/"
echo ""
echo "Next steps:"
echo "  1. Load extension in Chrome: chrome://extensions/"
echo "  2. Enable Developer Mode"
echo "  3. Click 'Load unpacked' and select browser-extension folder"
echo ""
echo "🚀 Ready to auto-fill!"
