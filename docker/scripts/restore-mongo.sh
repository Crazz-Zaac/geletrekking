docker cp /home/blackphoenix/backups/geletrekking/geletrekking-YYYY-MM-DD-HHMM.archive geletrekking-mongo:/tmp/restore.archive

docker exec geletrekking-mongo mongorestore \
  --username "$MONGO_USERNAME" \
  --password "$MONGO_PASSWORD" \
  --authenticationDatabase admin \
  --db geletrekking \
  --archive=/tmp/restore.archive \
  --gzip \
  --drop