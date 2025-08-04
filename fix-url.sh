#!/bin/bash

echo "🔧 Fixing URL issues..."

# Check current environment
echo "📋 Current Environment:"
echo "NEXTAUTH_URL: $NEXTAUTH_URL"
echo "NODE_ENV: $NODE_ENV"

# Check if containers are running
echo "🐳 Checking containers..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Containers are running"
else
    echo "❌ Containers are not running"
    echo "Starting containers..."
    docker-compose up -d
fi

# Check frontend logs
echo "📋 Frontend logs:"
docker-compose logs frontend --tail=20

# Check if frontend is accessible
echo "🌐 Checking frontend accessibility..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is accessible at http://localhost:3000"
else
    echo "❌ Frontend is not accessible at http://localhost:3000"
fi

# Check if nginx is accessible
echo "🌐 Checking nginx accessibility..."
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Nginx is accessible at http://localhost:80"
else
    echo "❌ Nginx is not accessible at http://localhost:80"
fi

echo "🎯 Correct URLs to use:"
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Login: http://localhost:3000/login"
echo "🌐 Production: https://thaihand.shop"
echo "🔗 Production Login: https://thaihand.shop/login" 