#!/bin/bash

# ThaiHand Backup Script
# Usage: ./backup.sh

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="thaihand_backup_$DATE"

echo "💾 Starting ThaiHand backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Database backup
echo "🗄️  Backing up database..."
docker-compose exec -T postgres pg_dump -U thaihand_user thaihand_db > "$BACKUP_DIR/${BACKUP_NAME}_database.sql"

# Application files backup
echo "📁 Backing up application files..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_app.tar.gz" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.git' \
    --exclude='backups' \
    .

# Environment variables backup
echo "🔐 Backing up environment variables..."
if [ -f .env ]; then
    cp .env "$BACKUP_DIR/${BACKUP_NAME}_env.txt"
fi

# SSL certificates backup
echo "🔒 Backing up SSL certificates..."
if [ -d nginx/ssl ]; then
    tar -czf "$BACKUP_DIR/${BACKUP_NAME}_ssl.tar.gz" nginx/ssl/
fi

# Create backup manifest
echo "📋 Creating backup manifest..."
cat > "$BACKUP_DIR/${BACKUP_NAME}_manifest.txt" << EOF
ThaiHand Backup Manifest
Date: $(date)
Backup ID: $BACKUP_NAME

Files included:
- ${BACKUP_NAME}_database.sql (Database dump)
- ${BACKUP_NAME}_app.tar.gz (Application files)
- ${BACKUP_NAME}_env.txt (Environment variables)
- ${BACKUP_NAME}_ssl.tar.gz (SSL certificates)

Backup size:
$(du -h "$BACKUP_DIR/${BACKUP_NAME}_*" | sort -hr)

Restore instructions:
1. Stop services: docker-compose down
2. Restore database: docker-compose exec -T postgres psql -U thaihand_user thaihand_db < ${BACKUP_NAME}_database.sql
3. Restore files: tar -xzf ${BACKUP_NAME}_app.tar.gz
4. Restore SSL: tar -xzf ${BACKUP_NAME}_ssl.tar.gz
5. Start services: docker-compose up -d
EOF

# Compress all backup files
echo "📦 Compressing backup files..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_complete.tar.gz" \
    -C "$BACKUP_DIR" \
    "${BACKUP_NAME}_database.sql" \
    "${BACKUP_NAME}_app.tar.gz" \
    "${BACKUP_NAME}_env.txt" \
    "${BACKUP_NAME}_ssl.tar.gz" \
    "${BACKUP_NAME}_manifest.txt"

# Clean up individual files
rm "$BACKUP_DIR/${BACKUP_NAME}_database.sql"
rm "$BACKUP_DIR/${BACKUP_NAME}_app.tar.gz"
rm "$BACKUP_DIR/${BACKUP_NAME}_env.txt"
rm "$BACKUP_DIR/${BACKUP_NAME}_ssl.tar.gz"
rm "$BACKUP_DIR/${BACKUP_NAME}_manifest.txt"

# Keep only last 7 backups
echo "🧹 Cleaning up old backups..."
cd "$BACKUP_DIR"
ls -t thaihand_backup_*_complete.tar.gz | tail -n +8 | xargs -r rm

echo "✅ Backup completed successfully!"
echo "📁 Backup location: $BACKUP_DIR/${BACKUP_NAME}_complete.tar.gz"
echo "📏 Backup size: $(du -h "$BACKUP_DIR/${BACKUP_NAME}_complete.tar.gz" | cut -f1)" 