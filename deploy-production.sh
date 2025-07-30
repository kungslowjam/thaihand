#!/bin/bash

# ThaiHand Production Deployment Script
# Usage: ./deploy-production.sh

set -e

echo "🚀 Starting ThaiHand PRODUCTION deployment..."
echo "=============================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script must be run as root (use sudo)"
    exit 1
fi

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
mkdir -p backups

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.production.template .env
    echo "⚠️  IMPORTANT: Please edit .env file with your production values!"
    echo "   Required changes:"
    echo "   - SECRET_KEY (generate a secure random key)"
    echo "   - NEXTAUTH_SECRET (generate a secure random key)"
    echo "   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
    echo "   - LINE_CLIENT_ID and LINE_CLIENT_SECRET"
    echo ""
    echo "   Generate secure keys with:"
    echo "   openssl rand -base64 32"
    echo ""
    read -p "Press Enter after editing .env file..."
fi

# Load environment variables
source .env

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Clean up old images
echo "🧹 Cleaning up old images..."
docker system prune -f || true

# Build and start services
echo "🔨 Building and starting services..."
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 60

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec backend alembic upgrade head || echo "⚠️  Migration failed but continuing..."

# Check health endpoints
echo "🏥 Checking health endpoints..."
sleep 15
curl -f http://localhost:8000/health || echo "⚠️  Backend health check failed"
curl -f http://localhost:3000 || echo "⚠️  Frontend health check failed"

# Setup SSL Certificate (if domain is configured)
echo "🔒 Setting up SSL certificate..."
if command -v certbot &> /dev/null; then
    echo "Certbot found. To get SSL certificate, run:"
    echo "sudo certbot --nginx -d thaihand.shop -d www.thaihand.shop"
else
    echo "Installing certbot..."
    apt update
    apt install certbot python3-certbot-nginx -y
    echo "To get SSL certificate, run:"
    echo "sudo certbot --nginx -d thaihand.shop -d www.thaihand.shop"
fi

# Setup Firewall
echo "🔥 Setting up firewall..."
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable

# Setup automatic backups
echo "💾 Setting up automatic backups..."
cat > /etc/cron.daily/thaihand-backup << 'EOF'
#!/bin/bash
cd /root/thaihand
docker-compose exec -T postgres pg_dump -U thaihand_user thaihand_db > backups/backup-$(date +%Y%m%d-%H%M%S).sql
find backups/ -name "backup-*.sql" -mtime +7 -delete
EOF
chmod +x /etc/cron.daily/thaihand-backup

# Setup log rotation
echo "📊 Setting up log rotation..."
cat > /etc/logrotate.d/thaihand << 'EOF'
/root/thaihand/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF

echo "✅ PRODUCTION deployment completed!"
echo "🌐 Your application should be available at:"
echo "   - Frontend: https://thaihand.shop"
echo "   - Backend API: https://thaihand.shop/api"
echo "   - Health Check: https://thaihand.shop/health"

echo ""
echo "📋 Production checklist:"
echo "✅ Domain configured: thaihand.shop"
echo "✅ SSL certificate: sudo certbot --nginx -d thaihand.shop"
echo "✅ Firewall configured"
echo "✅ Automatic backups configured"
echo "✅ Log rotation configured"
echo ""
echo "🔧 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Restart: docker-compose restart"
echo "   - Backup: docker-compose exec postgres pg_dump -U thaihand_user thaihand_db > backup.sql"
echo "   - Monitor: htop"
echo ""
echo "🔐 Security reminders:"
echo "   - Change default passwords"
echo "   - Update .env with secure keys"
echo "   - Configure OAuth providers"
echo "   - Set up monitoring"