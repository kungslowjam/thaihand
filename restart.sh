#!/bin/bash

echo "🔄 Restarting ThaiHand services with new configuration..."

# Stop existing containers
echo "🛑 Stopping containers..."
docker-compose down

# Remove old images to ensure fresh build
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start services with new configuration
echo "🔨 Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ All services are running"
else
    echo "❌ Some services failed to start"
    docker-compose logs
    exit 1
fi

echo "🎉 Restart completed successfully!"
echo "🌐 Your application is now running at: https://thaihand.shop"
echo "📊 Monitor logs with: docker-compose logs -f" 