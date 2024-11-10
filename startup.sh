#!/bin/bash

# Save this script as /home/pi/kiosk.sh
# Make it executable with: chmod +x /home/pi/kiosk.sh

# Configuration
REACT_APP_DIR="/home/fza/securebear-IMS/securebear-ims"  # Change this to your React app directory
REACT_PORT=3000                          # Change if your React app uses a different port

# Function to check if a process is running
is_process_running() {
    pgrep -f "$1" >/dev/null
}

# Kill any existing processes
killall -9 chromium-browser >/dev/null 2>&1
killall -9 node >/dev/null 2>&1

# Start React development server
cd $REACT_APP_DIR
npm start &

# Wait for React server to be ready
while ! nc -z localhost $REACT_PORT; do
    sleep 1
done

# Disable screen blanking and screensaver
xset s noblank
xset s off
xset -dpms

# Hide the mouse cursor
unclutter -idle 0.5 -root &

# Start Chromium in kiosk mode
chromium-browser --noerrdialogs \
                --disable-infobars \
                --kiosk \
                --disable-translate \
                --disable-features=TranslateUI \
                --disable-notifications \
                --start-maximized \
                --no-first-run \
                --fast \
                --fast-start \
                --disable-popup-blocking \
                --disable-restore-session-state \
                "http://localhost:$REACT_PORT"