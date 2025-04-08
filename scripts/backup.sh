#!/bin/bash
# SEO.engineering Backup Script
# =========================
# This script performs automated backups of MongoDB and PostgreSQL databases.
# It should be scheduled via cron to run daily.

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +"%Y-%m-%d-%H%M")
RETENTION_DAYS=7

# MongoDB backup
MONGO_BACKUP_FILE="mongodb-backup-${DATE}.gz"
MONGO_HOST="mongodb"
MONGO_USER=${MONGO_ROOT_USERNAME:-admin}
MONGO_PASS=${MONGO_ROOT_PASSWORD:-password}
MONGO_DB="seo.engineering"

# PostgreSQL backup
PG_BACKUP_FILE="postgres-backup-${DATE}.gz"
PG_HOST="postgres"
PG_USER="n8n"
PG_PASS=${DB_POSTGRESDB_PASSWORD:-n8n_password}
PG_DB="n8n"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# MongoDB backup
log "Starting MongoDB backup..."
mongodump --host=${MONGO_HOST} --username=${MONGO_USER} --password=${MONGO_PASS} --authenticationDatabase=admin --db=${MONGO_DB} --archive | gzip > "${BACKUP_DIR}/${MONGO_BACKUP_FILE}"

if [ $? -eq 0 ]; then
    log "MongoDB backup completed: ${MONGO_BACKUP_FILE}"
else
    log "MongoDB backup failed!"
fi

# PostgreSQL backup
log "Starting PostgreSQL backup..."
pg_dump -h ${PG_HOST} -U ${PG_USER} ${PG_DB} | gzip > "${BACKUP_DIR}/${PG_BACKUP_FILE}"

if [ $? -eq 0 ]; then
    log "PostgreSQL backup completed: ${PG_BACKUP_FILE}"
else
    log "PostgreSQL backup failed!"
fi

# Remove old backups
log "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
find ${BACKUP_DIR} -name "mongodb-backup-*.gz" -mtime +${RETENTION_DAYS} -delete
find ${BACKUP_DIR} -name "postgres-backup-*.gz" -mtime +${RETENTION_DAYS} -delete

# Create a backup report
TOTAL_SIZE=$(du -sh ${BACKUP_DIR} | cut -f1)
log "Backup complete. Total backup size: ${TOTAL_SIZE}"