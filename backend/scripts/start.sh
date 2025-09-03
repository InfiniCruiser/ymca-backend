#!/bin/bash

# Build the project
echo "Building backend..."
npm run build

# Copy files from nested structure to root dist
echo "Copying files to correct location..."
cp -r dist/backend/src/* dist/ 2>/dev/null || echo "Files already in correct location"

# Start the server
echo "Starting backend server..."
node dist/main.js
