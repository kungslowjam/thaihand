#!/bin/bash

# Setup script for Digital Ocean droplet
# This script should be run as root on a fresh Ubuntu server

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

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
   exit 1
fi

log "🚀 Starting server setup for ThaiHand application..."

# Update system
log "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
log "📦 Installing required packages..."
apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    nginx \
    certbot \
    python3-certbot-nginx

# Install Docker
log "🐳 Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Install Docker Compose
log "🐳 Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create thaihand user
log "👤 Creating thaihand user..."
useradd -m -s /bin/bash thaihand || true
usermod -aG docker thaihand

# Create project directory
log "📁 Creating project directory..."
mkdir -p /opt/thaihand
chown thaihand:thaihand /opt/thaihand

# Create backup directory
log "📁 Creating backup directory..."
mkdir -p /opt/backups
chown thaihand:thaihand /opt/backups

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

# Enable site
ln -sf /etc/nginx/sites-available/thaihand /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Setup log rotation
log "📝 Setting up log rotation..."
cat > /etc/logrotate.d/thaihand << 'EOF'
/opt/thaihand/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 thaihand thaihand
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# Create systemd service for auto-restart
log "⚙️ Creating systemd service..."
cat > /etc/systemd/system/thaihand.service << 'EOF'
[Unit]
Description=ThaiHand Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/thaihand
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=thaihand
Group=thaihand

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable thaihand.service

# Setup monitoring script
log "📊 Setting up monitoring..."
cat > /opt/monitor.sh << 'EOF'
#!/bin/bash

# Simple monitoring script
LOG_FILE="/var/log/thaihand-monitor.log"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# Check if containers are running
if ! docker ps | grep -q "thaihand"; then
    log "WARNING: ThaiHand containers are not running"
    cd /opt/thaihand && docker-compose up -d
    log "Attempted to restart containers"
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    log "WARNING: Disk usage is ${DISK_USAGE}%"
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 80 ]; then
    log "WARNING: Memory usage is ${MEM_USAGE}%"
fi
EOF

chmod +x /opt/monitor.sh

# Add monitoring to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/monitor.sh") | crontab -

# Setup backup script
log "💾 Setting up backup script..."
cat > /opt/backup.sh << 'EOF'
#!/bin/bash

# Backup script
BACKUP_DIR="/opt/backups"
PROJECT_DIR="/opt/thaihand"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="thaihand-backup-$DATE"

mkdir -p $BACKUP_DIR/$BACKUP_NAME

# Backup docker-compose files
cp $PROJECT_DIR/docker-compose.yml $BACKUP_DIR/$BACKUP_NAME/ 2>/dev/null || true
cp $PROJECT_DIR/docker-compose.prod.yml $BACKUP_DIR/$BACKUP_NAME/ 2>/dev/null || true

# Backup environment files
cp $PROJECT_DIR/.env* $BACKUP_DIR/$BACKUP_NAME/ 2>/dev/null || true

# Backup nginx config
cp -r $PROJECT_DIR/nginx $BACKUP_DIR/$BACKUP_NAME/ 2>/dev/null || true

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "thaihand-backup-*" -type d -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_NAME"
EOF

chmod +x /opt/backup.sh

# Add backup to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup.sh") | crontab -

# Create deployment script
log "🚀 Creating deployment script..."
cat > /opt/deploy.sh << 'EOF'
#!/bin/bash

# Deployment script
set -e

PROJECT_DIR="/opt/thaihand"
BACKUP_DIR="/opt/backups"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Create backup
log "Creating backup..."
/opt/backup.sh

# Navigate to project directory
cd $PROJECT_DIR

# Pull latest code
log "Pulling latest code..."
git pull origin main

# Stop containers
log "Stopping containers..."
docker-compose down

# Build and start containers
log "Building and starting containers..."
docker-compose build --no-cache
docker-compose up -d

# Wait for containers to be ready
log "Waiting for containers to be ready..."
sleep 30

# Health check
log "Performing health check..."
if curl -f http://localhost:8000/health >/dev/null 2>&1; then
    log "✅ Deployment successful"
else
    log "❌ Health check failed"
    docker-compose logs --tail=20
    exit 1
fi

# Clean up old images
log "Cleaning up old images..."
docker image prune -f
EOF

chmod +x /opt/deploy.sh
chown thaihand:thaihand /opt/deploy.sh

# Set up environment file template
log "📝 Creating environment file template..."
cat > /opt/thaihand/.env.example << 'EOF'
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/thaihand

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_URL=https://thaihand.shop
NEXTAUTH_SECRET=your_nextauth_secret

# API
NEXT_PUBLIC_API_URL=https://thaihand.shop/api

# Line Login
LINE_CLIENT_ID=your_line_client_id
LINE_CLIENT_SECRET=your_line_client_secret

# Google Login
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EOF

chown thaihand:thaihand /opt/thaihand/.env.example

# Final setup
log "🎉 Server setup completed!"
log ""
log "Next steps:"
log "1. Clone your repository: cd /opt/thaihand && git clone <your-repo-url> ."
log "2. Copy .env.example to .env and configure your environment variables"
log "3. Run: docker-compose up -d"
log "4. Set up SSL certificate: certbot --nginx -d thaihand.shop"
log ""
log "Useful commands:"
log "- Check status: systemctl status thaihand"
log "- View logs: docker-compose logs -f"
log "- Manual deploy: /opt/deploy.sh"
log "- Manual backup: /opt/backup.sh"
log ""

# Show system info
log "📊 System Information:"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo "Docker: $(docker --version)"
echo "Docker Compose: $(docker-compose --version)"
echo "Nginx: $(nginx -v 2>&1)"
echo "Disk Usage: $(df -h / | awk 'NR==2 {print $5}')"
echo "Memory Usage: $(free -h | awk 'NR==2 {print $3 "/" $2}')"

log "✅ Server setup completed successfully!"
