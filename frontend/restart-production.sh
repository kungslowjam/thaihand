#!/bin/bash

echo "🔄 Restarting Production Server..."

# Build the application
echo "📦 Building application..."
npm run build

# Restart the server
echo "🚀 Restarting server..."
pm2 restart thaihand-frontend

echo "✅ Production server restarted successfully!"
echo "🌐 Check: https://thaihand.shop" 