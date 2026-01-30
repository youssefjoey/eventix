#!/bin/bash

# EVENTIX Frontend Setup Script

echo ""
echo "========================================"
echo "   EVENTIX Frontend Setup"
echo "========================================"
echo ""

echo "Checking Node.js installation..."
node --version
if [ $? -ne 0 ]; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo ""
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies!"
    exit 1
fi

echo ""
echo "========================================"
echo "   Setup Complete!"
echo "========================================"
echo ""
echo "To start the development server, run:"
echo "   npm start"
echo ""
echo "The app will open at http://localhost:3000"
echo ""
echo "Make sure the backend is running on:"
echo "   http://localhost:8080"
echo ""

