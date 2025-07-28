#!/bin/bash

# ThaiHand Simple Deployment Script
# Usage: ./deploy-simple.sh

set -e

echo "🚀 ThaiHand Simple Deployment"
echo "============================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p nginx/ssl
mkdir -p logs

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f env.production.template ]; then
        cp env.production.template .env
    else
        cp backend/env.example .env
    fi
    echo "📝 Please edit .env file with your production values before continuing."
    echo "   Required variables:"
    echo "   - SECRET_KEY"
    echo "   - DATABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - NEXTAUTH_SECRET"
    echo "   - GOOGLE_CLIENT_ID"
    echo "   - GOOGLE_CLIENT_SECRET"
    echo "   - LINE_CLIENT_ID"
    echo "   - LINE_CLIENT_SECRET"
    exit 1
fi

# Create simple SSL certificate (self-signed)
echo "🔒 Creating SSL certificate..."
if [ ! -f nginx/ssl/cert.pem ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=TH/ST=Bangkok/L=Bangkok/O=ThaiHand/CN=localhost"
    echo "✅ SSL certificate created"
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec backend alembic upgrade head

# Simple health check
echo "🏥 Checking health endpoints..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should be available at:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - Health Check: http://localhost:8000/health"

echo ""
echo "📋 Next steps:"
echo "1. Configure your domain in nginx/nginx.conf"
echo "2. Set up proper SSL certificates (Let's Encrypt)"
echo "3. Configure firewall: sudo ufw allow 80,443"
echo "4. Set up automatic backups: ./backup.sh" 