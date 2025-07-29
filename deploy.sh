#!/bin/bash

# ThaiHand Deployment Script for VPS Hostinger
# Usage: ./deploy.sh

set -e

echo "🚀 Starting ThaiHand deployment..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p nginx/ssl
mkdir -p logs

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp backend/env.example .env
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

# Load environment variables
source .env

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

# Check health endpoints
echo "🏥 Checking health endpoints..."
curl -f http://localhost:8000/health || echo "❌ Backend health check failed"
curl -f http://localhost:3000 || echo "❌ Frontend health check failed"

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should be available at:"
echo "   - Frontend: https://thaihand.shop"
echo "   - Backend API: https://thaihand.shop/api"
echo "   - Health Check: https://thaihand.shop/health"

echo ""
echo "📋 Next steps:"
echo "1. ✅ Domain configured: thaihand.shop"
echo "2. 🔒 Add SSL certificates to nginx/ssl/"
echo "3. 🔥 Set up firewall rules: sudo ufw allow ssh,80,443 && sudo ufw enable"
echo "4. 💾 Configure automatic backups"
echo "5. 📊 Set up monitoring and logging"
echo ""
echo "🔐 SSL Certificate Setup:"
echo "   - Place your SSL certificate as: nginx/ssl/thaihand.shop.crt"
echo "   - Place your private key as: nginx/ssl/thaihand.shop.key"
echo "   - Or use Let's Encrypt: certbot --nginx -d thaihand.shop -d www.thaihand.shop" 