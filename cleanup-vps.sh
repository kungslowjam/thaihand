#!/bin/bash

# ThaiHand VPS Cleanup Script
# ใช้เมื่อ VPS มีของเก่าอยู่และต้องการ deploy โปรเจคใหม่

set -e

echo "🧹 Starting VPS cleanup for ThaiHand deployment..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run this script as root (use sudo)"
    exit 1
fi

echo "⚠️  WARNING: This script will remove existing Docker containers and volumes!"
echo "   Make sure you have backups of any important data."
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled."
    exit 1
fi

# Stop and remove existing Docker containers
echo "🐳 Cleaning up Docker containers..."
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Remove Docker images (optional - uncomment if needed)
# echo "🗑️  Removing Docker images..."
# docker rmi $(docker images -q) 2>/dev/null || true

# Remove Docker volumes (WARNING: This will delete all data!)
echo "🗑️  Removing Docker volumes..."
docker volume prune -f

# Remove Docker networks
echo "🌐 Cleaning up Docker networks..."
docker network prune -f

# Clean up system
echo "🧹 Cleaning up system..."
apt-get autoremove -y
apt-get autoclean

# Check for existing nginx configuration
if [ -f /etc/nginx/sites-available/default ]; then
    echo "📝 Backing up existing nginx configuration..."
    cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)
fi

# Check for existing SSL certificates
if [ -d /etc/letsencrypt ]; then
    echo "🔐 Backing up existing SSL certificates..."
    cp -r /etc/letsencrypt /etc/letsencrypt.backup.$(date +%Y%m%d_%H%M%S)
fi

# Remove old project directories (if they exist)
echo "📁 Cleaning up old project directories..."
rm -rf /root/thaihand 2>/dev/null || true
rm -rf /home/*/thaihand 2>/dev/null || true

# Check for existing services
echo "🔍 Checking for existing services..."
systemctl stop nginx 2>/dev/null || true
systemctl stop apache2 2>/dev/null || true
systemctl stop postgresql 2>/dev/null || true

# Disable services that might conflict
echo "⚙️  Disabling conflicting services..."
systemctl disable nginx 2>/dev/null || true
systemctl disable apache2 2>/dev/null || true
systemctl disable postgresql 2>/dev/null || true

# Update system
echo "🔄 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install/Update Docker
echo "🐳 Installing/Updating Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    rm get-docker.sh
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo "📦 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose already installed"
fi

# Install additional tools
echo "🛠️  Installing additional tools..."
apt-get install -y curl wget git certbot python3-certbot-nginx

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p /opt/thaihand
cd /opt/thaihand

echo "✅ VPS cleanup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Clone your ThaiHand repository to /opt/thaihand"
echo "2. Copy your .env file"
echo "3. Run: ./deploy.sh"
echo ""
echo "🔐 SSL Certificate Setup:"
echo "   sudo certbot --nginx -d thaihand.shop -d www.thaihand.shop"
echo ""
echo "🔥 Firewall Setup:"
echo "   sudo ufw allow ssh,80,443 && sudo ufw enable"