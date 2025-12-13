#!/bin/bash
# Open Database Viewer Script

echo "🗄️ Opening StratejiPlus Database Viewer..."
echo ""

# Check if API server is running
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "✅ API server is running"
    echo "🌐 Opening database viewer in browser..."
    open view-database.html
    echo ""
    echo "📊 Viewer opened! You can see your database data."
else
    echo "⚠️ API server is not running"
    echo ""
    echo "Starting API server..."
    cd "$(dirname "$0")"
    npm run server &
    sleep 3
    echo ""
    echo "✅ API server started"
    echo "🌐 Opening database viewer..."
    open view-database.html
    echo ""
    echo "📊 Viewer opened! Refresh if data doesn't load immediately."
fi

echo ""
echo "💡 To view again, just open: view-database.html"

