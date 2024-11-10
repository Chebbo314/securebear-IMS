#!/bin/bash

# Save as /home/pi/kiosk.sh
PORT=3000

# Kill any existing processes
killall -9 chromium-browser >/dev/null 2>&1

# Ensure the server is running
if ! pm2 list | grep -q "react-production"; then
    pm2 serve /home/fza/serve $PORT --spa --name "react-production"
fi

# Wait for server to be ready
while ! nc -z localhost $PORT; do
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
                "http://localhost:$PORT"