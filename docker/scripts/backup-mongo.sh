#!/usr/bin/env bash
# Nightly MongoDB backup.
#   1. Dumps the database to BACKUP_DIR on this server. Booking form submissions
#      (passport, medical and similar details) are deliberately left out.
#   2. Uploads it, encrypted, to Google Drive via the rclone remote "gdrive-crypt"
#      (skipped with a warning until that remote is configured).
#   3. Deletes old copies: LOCAL_RETENTION_DAYS here; in Drive, 30 daily copies
#      plus one copy per month (taken on the 1st) for 12 months.

set -euo pipefail

BACKUP_DIR="/home/blackphoenix/backups/geletrekking"
CONTAINER_NAME="geletrekking-mongo"
DATABASE_NAME="geletrekking"
LOCAL_RETENTION_DAYS="${LOCAL_RETENTION_DAYS:-14}"
REMOTE="${BACKUP_REMOTE:-gdrive-crypt}"
REMOTE_DAILY_DAYS=30
REMOTE_MONTHLY_DAYS=365
TIMESTAMP="$(date '+%Y-%m-%d-%H%M%S')"
ARCHIVE_NAME="geletrekking-${TIMESTAMP}.archive"
CONTAINER_ARCHIVE="/tmp/${ARCHIVE_NAME}"
HOST_ARCHIVE="${BACKUP_DIR}/${ARCHIVE_NAME}"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*"; }

# --- Failure alert -----------------------------------------------------------
# Any failure (dump, upload or cleanup) emails this run's output via the
# backend's SMTP settings. Recipient: BACKUP_ALERT_EMAIL, else SSL_ALERT_EMAIL,
# SUPERADMIN_EMAIL or EMAIL_USER from backend/.env.
RUN_LOG="$(mktemp)"
exec > >(tee "$RUN_LOG") 2>&1

send_alert() {
    local subject="$1"
    sleep 1 # let tee flush this run's output
    if ! /usr/bin/docker exec -i geletrekking-backend node -e '
        const sendEmail = require("/usr/src/app/utils/sendEmail");
        const to = (process.env.BACKUP_ALERT_EMAIL || process.env.SSL_ALERT_EMAIL || process.env.SUPERADMIN_EMAIL || process.env.EMAIL_USER || "").trim();
        let body = "";
        process.stdin.on("data", (c) => (body += c)).on("end", async () => {
          if (!to || !sendEmail.isConfigured()) { console.error("email not configured"); process.exit(1); }
          await sendEmail(to, process.argv[1], body);
          console.log("alert emailed to " + to);
        });
    ' "$subject" <<EOF
The Gele Trekking database backup on $(hostname) reported a problem at $(date '+%Y-%m-%d %H:%M %Z').

Output of this run:
----------------------------------------
$(cat "$RUN_LOG")
----------------------------------------

Full log: $BACKUP_DIR/backup.log
Local backups: $BACKUP_DIR
EOF
    then
        log "ERROR: could not send the alert email (is the backend container running?)"
    fi
}

on_exit() {
    local status=$?
    if [ "$status" -ne 0 ]; then
        log "Backup run FAILED (exit $status)"
        send_alert "[Gele Trekking] Backup FAILED on $(hostname)"
    fi
    rm -f "$RUN_LOG"
}
trap on_exit EXIT

mkdir -p "$BACKUP_DIR"

: "${MONGO_USERNAME:?MONGO_USERNAME is not set}"
: "${MONGO_PASSWORD:?MONGO_PASSWORD is not set}"

# --- 1. Dump ---------------------------------------------------------------
# mongodump is chatty; only print its output when it fails.
if ! dump_output="$(/usr/bin/docker exec "$CONTAINER_NAME" mongodump \
    --username "$MONGO_USERNAME" \
    --password "$MONGO_PASSWORD" \
    --authenticationDatabase admin \
    --db "$DATABASE_NAME" \
    --excludeCollection=bookingsubmissions \
    --archive="$CONTAINER_ARCHIVE" \
    --gzip 2>&1)"; then
    echo "$dump_output" | tail -n 20
    log "ERROR: mongodump failed"
    exit 1
fi

/usr/bin/docker cp "${CONTAINER_NAME}:${CONTAINER_ARCHIVE}" "$HOST_ARCHIVE"
/usr/bin/docker exec "$CONTAINER_NAME" rm -f "$CONTAINER_ARCHIVE"
chmod 600 "$HOST_ARCHIVE" # contains customer data

log "Backup created: $HOST_ARCHIVE ($(du -h "$HOST_ARCHIVE" | cut -f1))"

# --- 2. Off-site copy (Google Drive, encrypted by rclone crypt) ------------
upload_failed=0
if command -v rclone >/dev/null && rclone listremotes | grep -qx "${REMOTE}:"; then
    if rclone mkdir "${REMOTE}:daily" && rclone mkdir "${REMOTE}:monthly" \
        && rclone copy "$HOST_ARCHIVE" "${REMOTE}:daily/" \
        && { [ "$(date +%d)" != "01" ] || rclone copy "$HOST_ARCHIVE" "${REMOTE}:monthly/"; } \
        && rclone delete "${REMOTE}:daily/" --min-age "${REMOTE_DAILY_DAYS}d" \
        && rclone delete "${REMOTE}:monthly/" --min-age "${REMOTE_MONTHLY_DAYS}d"; then
        log "Uploaded to ${REMOTE}: and pruned old remote copies"
    else
        upload_failed=1
        log "ERROR: upload to ${REMOTE}: failed. Local copy is still in $BACKUP_DIR"
    fi
else
    log "WARNING: rclone remote '${REMOTE}:' not configured; backup is on this server only"
fi

# --- 3. Local retention ----------------------------------------------------
deleted="$(find "$BACKUP_DIR" -maxdepth 1 -type f -name 'geletrekking-*.archive' -mtime +"$LOCAL_RETENTION_DAYS" -print -delete | wc -l)"
log "Deleted $deleted local backup(s) older than $LOCAL_RETENTION_DAYS days"

exit "$upload_failed"
