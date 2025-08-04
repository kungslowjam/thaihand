#!/bin/bash

echo "🔨 Rebuilding ThaiHand containers..."

# Stop all containers
echo "🛑 Stopping containers..."
docker-compose down

# Remove old images
echo "🧹 Removing old images..."
docker-compose down --rmi all

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

# Check backend
if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

echo "🎉 Rebuild completed!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Login: http://localhost:3000/login" 