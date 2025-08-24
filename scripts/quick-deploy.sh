#!/bin/bash

# Quick deploy script for ThaiHand
# This script will set up everything from scratch

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# Configuration
REPO_URL="https://github.com/your-username/thaihand.git"
DOMAIN="thaihand.shop"

log "🚀 Starting quick deployment for ThaiHand..."

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
   exit 1
fi

# Update system
log "📦 Updating system..."
apt update && apt upgrade -y

# Install Docker
log "🐳 Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Install Docker Compose
log "🐳 Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx
log "🌐 Installing Nginx..."
apt install -y nginx certbot python3-certbot-nginx

# Create thaihand user
log "👤 Creating thaihand user..."
useradd -m -s /bin/bash thaihand || true
usermod -aG docker thaihand

# Create directories
log "📁 Creating directories..."
mkdir -p /opt/thaihand
mkdir -p /opt/backups
chown -R thaihand:thaihand /opt/thaihand
chown -R thaihand:thaihand /opt/backups

# Setup firewall
log "🔥 Setting up firewall..."
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Setup Nginx
log "🌐 Setting up Nginx..."
cat > /etc/nginx/sites-available/thaihand << 'EOF'
server {
    listen 80;
    server_name thaihand.shop www.thaihand.shop;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/thaihand /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Clone repository
log "📦 Cloning repository..."
cd /opt/thaihand
sudo -u thaihand git clone $REPO_URL .

# Create .env file
log "📝 Creating .env file..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    warning "Please edit .env file with your configuration values"
fi

# Set permissions
chown -R thaihand:thaihand /opt/thaihand
chmod 600 .env

# Start application
log "🚀 Starting application..."
cd /opt/thaihand
sudo -u thaihand docker-compose up -d

# Wait for containers
log "⏳ Waiting for containers to be ready..."
sleep 30

# Health check
log "🏥 Performing health check..."
if curl -f http://localhost:8000/health >/dev/null 2>&1; then
    log "✅ Application is healthy!"
else
    warning "Health check failed, but continuing..."
fi

# Setup SSL (if domain is configured)
log "🔒 Setting up SSL certificate..."
if [ -n "$DOMAIN" ]; then
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || warning "SSL setup failed - please configure manually"
fi

# Create monitoring script
log "📊 Setting up monitoring..."
cat > /opt/monitor.sh << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/thaihand-monitor.log"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

if ! docker ps | grep -q "thaihand"; then
    log "WARNING: ThaiHand containers are not running"
    cd /opt/thaihand && docker-compose up -d
    log "Attempted to restart containers"
fi

DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    log "WARNING: Disk usage is ${DISK_USAGE}%"
fi
EOF

chmod +x /opt/monitor.sh
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/monitor.sh") | crontab -

# Create backup script
log "💾 Setting up backup script..."
cat > /opt/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
PROJECT_DIR="/opt/thaihand"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="thaihand-backup-$DATE"

mkdir -p $BACKUP_DIR/$BACKUP_NAME
cp $PROJECT_DIR/docker-compose.yml $BACKUP_DIR/$BACKUP_NAME/ 2>/dev/null || true
cp $PROJECT_DIR/.env* $BACKUP_DIR/$BACKUP_NAME/ 2>/dev/null || true
cp -r $PROJECT_DIR/nginx $BACKUP_DIR/$BACKUP_NAME/ 2>/dev/null || true

find $BACKUP_DIR -name "thaihand-backup-*" -type d -mtime +7 -exec rm -rf {} \;
echo "Backup completed: $BACKUP_NAME"
EOF

chmod +x /opt/backup.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup.sh") | crontab -

# Final status
log "🎉 Quick deployment completed!"
log ""
log "📊 System Information:"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Docker: $(docker --version)"
echo "Docker Compose: $(docker-compose --version)"
echo "Nginx: $(nginx -v 2>&1)"
echo "Disk Usage: $(df -h / | awk 'NR==2 {print $5}')"
echo "Memory Usage: $(free -h | awk 'NR==2 {print $3 "/" $2}')"
log ""
log "📋 Next steps:"
log "1. Edit .env file: nano /opt/thaihand/.env"
log "2. Check application status: docker-compose ps"
log "3. View logs: docker-compose logs -f"
log "4. Set up SSL manually if needed: certbot --nginx -d $DOMAIN"
log ""
log "🔗 Useful commands:"
log "- Check status: docker-compose ps"
log "- View logs: docker-compose logs -f"
log "- Restart: docker-compose restart"
log "- Update: git pull && docker-compose up -d --build"
log ""

# Show current status
log "📈 Current Status:"
docker-compose ps
