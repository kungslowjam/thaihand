#!/bin/bash

# Production Deployment Script for ThaiHand
echo "🚀 Starting ThaiHand Production Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with production environment variables"
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
required_vars=(
    "NEXT_PUBLIC_API_URL"
    "NEXTAUTH_URL"
    "NEXTAUTH_SECRET"
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
    "LINE_CLIENT_ID"
    "LINE_CLIENT_SECRET"
    "SECRET_KEY"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set in .env file"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images to ensure fresh build
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."

# Check nginx
if curl -f https://thaihand.shop/api/health > /dev/null 2>&1; then
    echo "✅ Nginx is healthy"
else
    echo "❌ Nginx health check failed"
fi

# Check backend
if curl -f https://thaihand.shop/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

# Check frontend
if curl -f https://thaihand.shop > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

echo "🎉 Deployment completed!"
echo "🌐 Your application is now running at: https://thaihand.shop"
echo "📊 Monitor logs with: docker-compose logs -f" 