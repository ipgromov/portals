#!/bin/bash
# Simple script to start the local server

echo "🚀 Starting Portals server..."
echo "📍 Your site will be available at: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")"
python3 -m http.server 8000

