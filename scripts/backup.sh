#!/bin/bash

# Automated Backup Script
# SEO.engineering Platform
# Created: April 8, 2025

# Configuration
BACKUP_DIR="/home/tabs/seo-engineering/backups"
DATE=$(date +%Y-%m-%d)
BACKUP_NAME="seo-engineering-backup-$DATE"
RETENTION_DAYS=14

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Starting backup process at $(date)"

# Create backup directory for this run
mkdir -p $BACKUP_DIR/$BACKUP_NAME

# 1. Backup MongoDB data
echo "Backing up MongoDB data..."
echo "1123" | sudo -S docker exec seo-mongodb mongodump --out=/tmp/mongodb-backup
echo "1123" | sudo -S docker cp seo-mongodb:/tmp/mongodb-backup $BACKUP_DIR/$BACKUP_NAME/mongodb
echo "1123" | sudo -S docker exec seo-mongodb rm -rf /tmp/mongodb-backup

# 2. Backup Redis data
echo "Backing up Redis data..."
echo "1123" | sudo -S docker exec seo-redis redis-cli SAVE
echo "1123" | sudo -S docker cp seo-redis:/data/dump.rdb $BACKUP_DIR/$BACKUP_NAME/redis-dump.rdb

# 3. Backup configuration files
echo "Backing up configuration files..."
cp -r /home/tabs/seo-engineering/nginx $BACKUP_DIR/$BACKUP_NAME/
cp -r /home/tabs/seo-engineering/grafana $BACKUP_DIR/$BACKUP_NAME/
cp -r /home/tabs/seo-engineering/deployment $BACKUP_DIR/$BACKUP_NAME/

# 4. Compress the backup
echo "Compressing backup..."
cd $BACKUP_DIR
tar -czf $BACKUP_NAME.tar.gz $BACKUP_NAME
rm -rf $BACKUP_NAME

# 5. Clean up old backups (retention policy)
echo "Applying retention policy ($RETENTION_DAYS days)..."
find $BACKUP_DIR -name "seo-engineering-backup-*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "Backup completed at $(date)"
echo "Backup stored at: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
