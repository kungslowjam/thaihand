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

# Check required environment variables
echo "🔍 Checking environment variables..."
required_vars=(
    "LINE_CLIENT_ID"
    "LINE_CLIENT_SECRET"
    "NEXTAUTH_URL"
    "NEXTAUTH_SECRET"
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set in .env file"
        exit 1
    fi
done

echo "✅ All required environment variables are set"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images
echo "🧹 Cleaning up old images..."
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
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

# Check backend
if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

# Check nginx
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Nginx is healthy"
else
    echo "❌ Nginx health check failed"
fi

echo "🎉 Deployment completed!"
echo "🌐 Production URL: https://thaihand.shop"
echo "🔗 Login URL: https://thaihand.shop/login"

# Show container status
echo "📊 Container Status:"
docker-compose ps 