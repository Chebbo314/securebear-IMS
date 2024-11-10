#!/bin/bash

# Save as /home/pi/deploy-react.sh
# Configuration
REACT_APP_DIR="/home/fza/securebear-IMS/securebear-ims"
PORT=3000
SERVE_DIR="/home/fza/serve"

# Install required packages if not present
if ! command -v serve &> /dev/null; then
    echo "Installing serve..."
    npm install -g serve
fi

if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Create production build
echo "Creating production build..."
cd $REACT_APP_DIR
npm install
npm run build

# Create serve directory if it doesn't exist
mkdir -p $SERVE_DIR

# Copy build files to serve directory
cp -r build/* $SERVE_DIR/

# Stop any existing PM2 processes
pm2 stop all >/dev/null 2>&1
pm2 delete all >/dev/null 2>&1

# Start the production server with PM2
echo "Starting production server..."
pm2 serve $SERVE_DIR $PORT --spa --name "react-production"

# Save PM2 process list
pm2 save

echo "Deployment complete! Your app is running at http://localhost:$PORT"