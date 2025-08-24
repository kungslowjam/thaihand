#!/bin/bash

# Initialize project on server
# This script should be run after setup-droplet.sh

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
PROJECT_DIR="/opt/thaihand"
REPO_URL="https://github.com/your-username/thaihand.git"

log "🚀 Initializing ThaiHand project..."

# Check if running as thaihand user
if [[ $EUID -eq 0 ]]; then
   error "This script should be run as thaihand user, not root"
   exit 1
fi

# Navigate to project directory
cd $PROJECT_DIR

# Check if repository already exists
if [ -d ".git" ]; then
    warning "Repository already exists. Pulling latest changes..."
    git pull origin main
else
    log "📦 Cloning repository..."
    git clone $REPO_URL .
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    log "📝 Creating .env file from template..."
    cp .env.example .env
    warning "Please edit .env file with your actual configuration values"
else
    log "📝 .env file already exists"
fi

# Create logs directory
mkdir -p logs

# Set proper permissions
chmod 600 .env

log "✅ Project initialization completed!"
log ""
log "Next steps:"
log "1. Edit .env file with your configuration: nano .env"
log "2. Start the application: docker-compose up -d"
log "3. Check logs: docker-compose logs -f"
log "4. Set up SSL: sudo certbot --nginx -d thaihand.shop"
log ""
