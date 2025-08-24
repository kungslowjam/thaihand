#!/bin/bash

# Backup script for ThaiHand application
# This script creates backups of database, files, and configuration

set -e

# Configuration
PROJECT_DIR="/opt/thaihand"
BACKUP_DIR="/opt/backups"
LOG_FILE="/var/log/thaihand-backup.log"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

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

# Function to create database backup
backup_database() {
    log "Creating database backup..."
    
    BACKUP_NAME="db-backup-$(date +%Y%m%d-%H%M%S).sql"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    # Load environment variables
    source $PROJECT_DIR/.env
    
    # Create database backup
    docker-compose -f $PROJECT_DIR/docker-compose.prod.yml exec -T postgres \
        pg_dump -U $POSTGRES_USER $POSTGRES_DB > $BACKUP_PATH
    
    if [ $? -eq 0 ]; then
        log "Database backup created: $BACKUP_PATH"
        # Compress backup
        gzip $BACKUP_PATH
        log "Database backup compressed: $BACKUP_PATH.gz"
    else
        error "Database backup failed"
        return 1
    fi
}

# Function to backup Docker volumes
backup_volumes() {
    log "Creating Docker volumes backup..."
    
    BACKUP_NAME="volumes-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    # Stop containers to ensure data consistency
    cd $PROJECT_DIR
    docker-compose -f docker-compose.prod.yml stop postgres redis
    
    # Create volumes backup
    docker run --rm -v thaihand_postgres_data:/data -v $BACKUP_DIR:/backup alpine \
        tar czf /backup/$BACKUP_NAME /data
    
    # Restart containers
    docker-compose -f docker-compose.prod.yml start postgres redis
    
    if [ $? -eq 0 ]; then
        log "Volumes backup created: $BACKUP_PATH"
    else
        error "Volumes backup failed"
        return 1
    fi
}

# Function to backup configuration files
backup_config() {
    log "Creating configuration backup..."
    
    BACKUP_NAME="config-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    # Create configuration backup
    tar czf $BACKUP_PATH \
        -C $PROJECT_DIR \
        docker-compose.prod.yml \
        .env \
        nginx/ \
        scripts/ \
        alembic.ini \
        alembic/
    
    if [ $? -eq 0 ]; then
        log "Configuration backup created: $BACKUP_PATH"
    else
        error "Configuration backup failed"
        return 1
    fi
}

# Function to upload backup to S3 (if configured)
upload_to_s3() {
    if [ -n "$BACKUP_S3_BUCKET" ] && [ -n "$BACKUP_S3_ACCESS_KEY" ] && [ -n "$BACKUP_S3_SECRET_KEY" ]; then
        log "Uploading backups to S3..."
        
        # Install AWS CLI if not present
        if ! command -v aws &> /dev/null; then
            log "Installing AWS CLI..."
            curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
            unzip awscliv2.zip
            sudo ./aws/install
            rm -rf aws awscliv2.zip
        fi
        
        # Configure AWS CLI
        export AWS_ACCESS_KEY_ID=$BACKUP_S3_ACCESS_KEY
        export AWS_SECRET_ACCESS_KEY=$BACKUP_S3_SECRET_KEY
        export AWS_DEFAULT_REGION=ap-southeast-1
        
        # Upload latest backups
        for backup_file in $(ls -t $BACKUP_DIR/*.gz 2>/dev/null | head -5); do
            filename=$(basename $backup_file)
            aws s3 cp $backup_file s3://$BACKUP_S3_BUCKET/backups/$filename
            if [ $? -eq 0 ]; then
                log "Uploaded to S3: $filename"
            else
                warning "Failed to upload to S3: $filename"
            fi
        done
    else
        log "S3 backup not configured, skipping upload"
    fi
}

# Function to clean old backups
cleanup_old_backups() {
    log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    # Remove old local backups
    find $BACKUP_DIR -name "*.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    # Remove old S3 backups if configured
    if [ -n "$BACKUP_S3_BUCKET" ] && [ -n "$BACKUP_S3_ACCESS_KEY" ] && [ -n "$BACKUP_S3_SECRET_KEY" ]; then
        export AWS_ACCESS_KEY_ID=$BACKUP_S3_ACCESS_KEY
        export AWS_SECRET_ACCESS_KEY=$BACKUP_S3_SECRET_KEY
        export AWS_DEFAULT_REGION=ap-southeast-1
        
        # List and delete old S3 backups
        aws s3 ls s3://$BACKUP_S3_BUCKET/backups/ | while read -r line; do
            createDate=$(echo $line | awk {'print $1'})
            createDate=$(date -d "$createDate" +%s)
            olderThan=$(date -d "-$RETENTION_DAYS days" +%s)
            if [[ $createDate -lt $olderThan ]]; then
                fileName=$(echo $line | awk {'print $4'})
                if [[ $fileName != "" ]]; then
                    aws s3 rm s3://$BACKUP_S3_BUCKET/backups/$fileName
                    log "Deleted old S3 backup: $fileName"
                fi
            fi
        done
    fi
}

# Function to show backup status
status() {
    log "Backup status:"
    
    echo "=== Recent Backups ==="
    ls -la $BACKUP_DIR/*.gz 2>/dev/null | head -10 || echo "No backups found"
    
    echo -e "\n=== Backup Directory Size ==="
    du -sh $BACKUP_DIR
    
    echo -e "\n=== Available Disk Space ==="
    df -h $BACKUP_DIR
    
    if [ -n "$BACKUP_S3_BUCKET" ]; then
        echo -e "\n=== S3 Backup Status ==="
        export AWS_ACCESS_KEY_ID=$BACKUP_S3_ACCESS_KEY
        export AWS_SECRET_ACCESS_KEY=$BACKUP_S3_SECRET_KEY
        export AWS_DEFAULT_REGION=ap-southeast-1
        
        aws s3 ls s3://$BACKUP_S3_BUCKET/backups/ --recursive --summarize 2>/dev/null || echo "S3 access failed"
    fi
}

# Main backup function
backup() {
    log "Starting backup process..."
    
    # Load environment variables
    if [ -f "$PROJECT_DIR/.env" ]; then
        source $PROJECT_DIR/.env
    else
        error "Environment file not found: $PROJECT_DIR/.env"
        exit 1
    fi
    
    # Create backups
    backup_database
    backup_volumes
    backup_config
    
    # Upload to S3
    upload_to_s3
    
    # Cleanup old backups
    cleanup_old_backups
    
    log "Backup process completed successfully!"
}

# Main script logic
case "${1:-backup}" in
    "backup")
        backup
        ;;
    "status")
        status
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    "upload")
        upload_to_s3
        ;;
    *)
        echo "Usage: $0 {backup|status|cleanup|upload}"
        echo "  backup   - Create full backup (database, volumes, config)"
        echo "  status   - Show backup status and recent backups"
        echo "  cleanup  - Clean up old backups"
        echo "  upload   - Upload existing backups to S3"
        exit 1
        ;;
esac
