#!/usr/bin/env bash

set -euo pipefail

BACKUP_DIR="/home/blackphoenix/backups/geletrekking"
CONTAINER_NAME="geletrekking-mongo"
DATABASE_NAME="geletrekking"
TIMESTAMP="$(date '+%Y-%m-%d-%H%M%S')"
ARCHIVE_NAME="geletrekking-${TIMESTAMP}.archive"
CONTAINER_ARCHIVE="/tmp/${ARCHIVE_NAME}"
HOST_ARCHIVE="${BACKUP_DIR}/${ARCHIVE_NAME}"

mkdir -p "$BACKUP_DIR"

: "${MONGO_USERNAME:?MONGO_USERNAME is not set}"
: "${MONGO_PASSWORD:?MONGO_PASSWORD is not set}"

/usr/bin/docker exec "$CONTAINER_NAME" mongodump \
    --username "$MONGO_USERNAME" \
    --password "$MONGO_PASSWORD" \
    --authenticationDatabase admin \
    --db "$DATABASE_NAME" \
    --archive="$CONTAINER_ARCHIVE" \
    --gzip

/usr/bin/docker cp \
    "${CONTAINER_NAME}:${CONTAINER_ARCHIVE}" \
    "$HOST_ARCHIVE"

/usr/bin/docker exec "$CONTAINER_NAME" rm -f "$CONTAINER_ARCHIVE"

echo "$(date '+%Y-%m-%d %H:%M:%S') Backup created: $HOST_ARCHIVE"

find /home/blackphoenix/backups/geletrekking -type f -name "geletrekking-*.archive" -mtime +30 -delete