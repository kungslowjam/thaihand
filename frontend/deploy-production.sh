#!/bin/bash

# Production Deployment Script for ThaiHand Frontend

echo "🚀 Starting Production Deployment..."

# 1. Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 3. Set production environment
export NODE_ENV=production

# 4. Build the application
echo "🔨 Building for production..."
npm run build

# 5. Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# 6. Start the production server
echo "🌐 Starting production server..."
npm start

# Alternative: Use PM2 for process management
# echo "🌐 Starting with PM2..."
# npm install -g pm2
# pm2 start npm --name "thaihand-frontend" -- start
# pm2 save
# pm2 startup

echo "🎉 Deployment completed!"
echo "📱 Your app should be running at: https://thaihand.shop"
echo "🔍 Check logs with: pm2 logs thaihand-frontend" 