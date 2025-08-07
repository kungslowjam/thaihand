#!/bin/bash

# Deployment script for Digital Ocean droplets
# This script should be run on the Digital Ocean droplet

set -e

# Configuration
PROJECT_DIR="/opt/thaihand"
BACKUP_DIR="/opt/backups"
LOG_FILE="/var/log/thaihand-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a $LOG_FILE
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
   exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Function to create backup
create_backup() {
    log "Creating backup of current deployment..."
    
    BACKUP_NAME="thaihand-backup-$(date +%Y%m%d-%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    mkdir -p $BACKUP_PATH
    
    # Backup docker-compose.yml
    if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
        cp "$PROJECT_DIR/docker-compose.yml" "$BACKUP_PATH/"
    fi
    
    # Backup environment files
    if [ -f "$PROJECT_DIR/.env" ]; then
        cp "$PROJECT_DIR/.env" "$BACKUP_PATH/"
    fi
    
    # Backup nginx configuration
    if [ -d "$PROJECT_DIR/nginx" ]; then
        cp -r "$PROJECT_DIR/nginx" "$BACKUP_PATH/"
    fi
    
    log "Backup created at: $BACKUP_PATH"
}

# Function to rollback
rollback() {
    error "Deployment failed, rolling back..."
    
    # Find the latest backup
    LATEST_BACKUP=$(ls -t $BACKUP_DIR/thaihand-backup-* 2>/dev/null | head -1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        log "Rolling back to: $LATEST_BACKUP"
        
        # Restore docker-compose.yml
        if [ -f "$LATEST_BACKUP/docker-compose.yml" ]; then
            cp "$LATEST_BACKUP/docker-compose.yml" "$PROJECT_DIR/"
        fi
        
        # Restore .env if exists
        if [ -f "$LATEST_BACKUP/.env" ]; then
            cp "$LATEST_BACKUP/.env" "$PROJECT_DIR/"
        fi
        
        # Restart with old configuration
        cd $PROJECT_DIR
        docker-compose down
        docker-compose up -d
        
        log "Rollback completed"
    else
        error "No backup found for rollback"
    fi
}

# Main deployment function
deploy() {
    log "Starting deployment..."
    
    # Create backup before deployment
    create_backup
    
    # Navigate to project directory
    cd $PROJECT_DIR
    
    # Stop current containers
    log "Stopping current containers..."
    docker-compose down || true
    
    # Pull latest images
    log "Pulling latest images..."
    docker-compose pull || {
        error "Failed to pull images"
        rollback
        exit 1
    }
    
    # Start containers
    log "Starting containers..."
    docker-compose up -d || {
        error "Failed to start containers"
        rollback
        exit 1
    }
    
    # Wait for containers to be ready
    log "Waiting for containers to be ready..."
    sleep 30
    
    # Run database migrations
    log "Running database migrations..."
    docker-compose exec -T backend alembic upgrade head || {
        warning "Database migration failed, but continuing..."
    }
    
    # Health check
    log "Performing health check..."
    for i in {1..10}; do
        if curl -f http://localhost/health >/dev/null 2>&1; then
            log "Health check passed"
            break
        else
            if [ $i -eq 10 ]; then
                error "Health check failed after 10 attempts"
                rollback
                exit 1
            fi
            log "Health check attempt $i failed, retrying in 10 seconds..."
            sleep 10
        fi
    done
    
    # Clean up old images
    log "Cleaning up old images..."
    docker image prune -f
    
    # Clean up old backups (keep last 5)
    log "Cleaning up old backups..."
    ls -t $BACKUP_DIR/thaihand-backup-* 2>/dev/null | tail -n +6 | xargs -r rm -rf
    
    log "Deployment completed successfully!"
}

# Function to show deployment status
status() {
    log "Checking deployment status..."
    
    cd $PROJECT_DIR
    
    echo "=== Container Status ==="
    docker-compose ps
    
    echo -e "\n=== Container Logs ==="
    docker-compose logs --tail=20
    
    echo -e "\n=== Health Check ==="
    if curl -f http://localhost/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Application is healthy${NC}"
    else
        echo -e "${RED}✗ Application health check failed${NC}"
    fi
}

# Function to show available backups
backups() {
    log "Available backups:"
    ls -la $BACKUP_DIR/thaihand-backup-* 2>/dev/null || echo "No backups found"
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "status")
        status
        ;;
    "backups")
        backups
        ;;
    "rollback")
        rollback
        ;;
    *)
        echo "Usage: $0 {deploy|status|backups|rollback}"
        echo "  deploy   - Deploy the application"
        echo "  status   - Show deployment status"
        echo "  backups  - List available backups"
        echo "  rollback - Rollback to previous deployment"
        exit 1
        ;;
esac
