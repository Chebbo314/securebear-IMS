#!/bin/bash

# Script to launch the payment system in fullscreen mode
# Save this as start-payment.sh

# Configuration
APP_DIR="/home/fza/securebear-IMS/securebear-ims/"  # Replace with your actual project directory
DISPLAY=:0                         # Default display
CHROMIUM_FLAGS="--kiosk --disable-restore-session-state --noerrdialogs --disable-infobars"

# Function to check if the server is running
check_server() {
    curl -s http://localhost:3000 > /dev/null
    return $?
}

# Navigate to application directory
cd "$APP_DIR" || {
    echo "Error: Could not find application directory"
    exit 1
}

# Start the development server
echo "Starting npm server..."
npm start &

# Wait for server to be ready
echo "Waiting for server to start..."
while ! check_server; do
    sleep 1
done

# Launch Chromium in kiosk mode
echo "Launching browser in fullscreen..."
DISPLAY=:0 chromium-browser $CHROMIUM_FLAGS "http://localhost:3000" &

# Keep script running to maintain the processes
wait