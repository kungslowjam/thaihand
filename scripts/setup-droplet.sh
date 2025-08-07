#!/bin/bash

# Setup script for Digital Ocean droplets
# This script should be run once on a fresh Digital Ocean droplet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
   exit 1
fi

log "Starting Digital Ocean droplet setup for ThaiHand..."

# Update system
log "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required packages
log "Installing required packages..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    git \
    unzip \
    htop \
    nginx \
    certbot \
    python3-certbot-nginx \
    fail2ban \
    ufw

# Install Docker
log "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Install Docker Compose
log "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create application user
log "Creating application user..."
useradd -m -s /bin/bash thaihand
usermod -aG docker thaihand

# Create application directory
log "Creating application directory..."
mkdir -p /opt/thaihand
mkdir -p /opt/backups
mkdir -p /var/log/thaihand
chown -R thaihand:thaihand /opt/thaihand
chown -R thaihand:thaihand /opt/backups
chown -R thaihand:thaihand /var/log/thaihand

# Configure firewall
log "Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp

# Configure fail2ban
log "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl restart fail2ban

# Configure nginx
log "Configuring nginx..."
cat > /etc/nginx/sites-available/thaihand << EOF
server {
    listen 80;
    server_name thaihand.shop www.thaihand.shop;
    
    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name thaihand.shop www.thaihand.shop;
    
    # SSL configuration will be added by certbot
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Proxy to Docker containers
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:8000/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/thaihand /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Create systemd service for automatic startup
log "Creating systemd service..."
cat > /etc/systemd/system/thaihand.service << EOF
[Unit]
Description=ThaiHand Application
Requires=docker.service
After=docker.service

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

# Enable the service
systemctl enable thaihand.service

# Create log rotation
log "Configuring log rotation..."
cat > /etc/logrotate.d/thaihand << EOF
/var/log/thaihand/*.log {
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

# Create monitoring script
log "Creating monitoring script..."
cat > /opt/thaihand/monitor.sh << 'EOF'
#!/bin/bash

# Simple monitoring script
LOG_FILE="/var/log/thaihand/monitor.log"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# Check if containers are running
if ! docker-compose -f /opt/thaihand/docker-compose.yml ps | grep -q "Up"; then
    log "ERROR: Containers are not running"
    systemctl restart thaihand.service
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    log "WARNING: Disk usage is ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
    log "WARNING: Memory usage is ${MEMORY_USAGE}%"
fi
EOF

chmod +x /opt/thaihand/monitor.sh
chown thaihand:thaihand /opt/thaihand/monitor.sh

# Add monitoring to crontab
(crontab -u thaihand -l 2>/dev/null; echo "*/5 * * * * /opt/thaihand/monitor.sh") | crontab -u thaihand -

# Create SSL certificate (will be configured later)
log "SSL certificate will be configured after domain is pointed to this server"

# Final configuration
log "Finalizing setup..."

# Set proper permissions
chown -R thaihand:thaihand /opt/thaihand

# Restart services
systemctl restart nginx
systemctl restart docker

log "Setup completed successfully!"
log ""
log "Next steps:"
log "1. Point your domain (thaihand.shop) to this server's IP address"
log "2. Run: sudo certbot --nginx -d thaihand.shop -d www.thaihand.shop"
log "3. Copy your application files to /opt/thaihand/"
log "4. Create .env file with your environment variables"
log "5. Run: sudo -u thaihand docker-compose up -d"
log ""
log "For GitLab CI/CD deployment:"
log "1. Add SSH key to GitLab CI/CD variables"
log "2. Configure environment variables in GitLab"
log "3. Push to main branch to trigger deployment"
