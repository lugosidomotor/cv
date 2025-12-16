#!/bin/bash

# Stay Green - Teams/Slack "Away" status preventer
# 
# FIRST: Add Terminal to Accessibility permissions!
# # Ez megnyitja a beállításokat a megfelelő helyen
#  open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"

#
# THEN: brew install cliclick
#
# Usage: ./stay-green.sh
# Stop: Ctrl+C

echo "🟢 Stay Green - Teams Away Preventer"
echo "Press Ctrl+C to stop"
echo ""

# Check if cliclick is installed
if ! command -v cliclick &> /dev/null; then
    echo "❌ cliclick not found. Install it with:"
    echo "   brew install cliclick"
    echo ""
    echo "Also make sure Terminal has Accessibility permissions:"
    echo "   System Settings → Privacy & Security → Accessibility"
    exit 1
fi

INTERVAL=1  # seconds (3 minutes)

while true; do
    # Get current mouse position
    POS=$(cliclick p 2>/dev/null)
    
    if [ -z "$POS" ]; then
        echo "❌ Cannot get mouse position. Add Terminal to Accessibility:"
        echo "   System Settings → Privacy & Security → Accessibility"
        exit 1
    fi
    
    X=$(echo $POS | cut -d',' -f1)
    Y=$(echo $POS | cut -d',' -f2)
    
    # Move mouse 10 pixels right and back
    cliclick m:$((X+10)),$Y
    sleep 0.3
    cliclick m:$X,$Y
    
    TIMESTAMP=$(date '+%H:%M:%S')
    echo "[$TIMESTAMP] 🖱️  Mouse moved 50px - staying green..."
    
    sleep $INTERVAL
done
