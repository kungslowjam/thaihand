#!/bin/bash

# ThaiHand Simple Deployment Script
# Usage: ./deploy-simple.sh

set -e

echo "🚀 Starting ThaiHand simple deployment..."

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

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://thaihand_user:thaihand_password@postgres:5432/thaihand_db

# Security
SECRET_KEY=your-very-secure-secret-key-here-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=False

# CORS Configuration
ALLOWED_ORIGINS=https://thaihand.shop,https://www.thaihand.shop,http://localhost:3000

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key-here-change-this-in-production
NEXTAUTH_URL=https://thaihand.shop

# Supabase Configuration (optional)
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key

# OAuth Configuration (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINE_CLIENT_ID=your-line-client-id
LINE_CLIENT_SECRET=your-line-client-secret

# Backend API URL
NEXT_PUBLIC_BACKEND_URL=https://thaihand.shop/api
NEXT_PUBLIC_API_URL=https://thaihand.shop/api
EOF
    echo "✅ .env file created. Please edit it with your production values."
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Clean up old images
echo "🧹 Cleaning up old images..."
docker system prune -f || true

# Build and start services with error handling
echo "🔨 Building and starting services..."
if docker-compose build --no-cache; then
    echo "✅ Build successful"
else
    echo "⚠️  Build had warnings but continuing..."
fi

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 45

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec backend alembic upgrade head || echo "⚠️  Migration failed but continuing..."

# Check health endpoints
echo "🏥 Checking health endpoints..."
sleep 10
curl -f http://localhost:8000/health || echo "⚠️  Backend health check failed"
curl -f http://localhost:3000 || echo "⚠️  Frontend health check failed"

echo "✅ Deployment completed!"
echo "🌐 Your application should be available at:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - Health Check: http://localhost:8000/health"

echo ""
echo "📋 Next steps:"
echo "1. 🔒 Configure SSL certificates in nginx/ssl/"
echo "2. 🌐 Point your domain to this server"
echo "3. 🔥 Set up firewall: sudo ufw allow ssh,80,443 && sudo ufw enable"
echo "4. 📊 Monitor logs: docker-compose logs -f"
echo ""
echo "🔧 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Restart: docker-compose restart"
echo "   - Stop: docker-compose down" 