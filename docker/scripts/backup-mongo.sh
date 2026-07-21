cd /home/blackphoenix/geletrekking/docker

mkdir -p /home/blackphoenix/backups/geletrekking

docker exec geletrekking-mongo mongodump \
  --username "$MONGO_USERNAME" \
  --password "$MONGO_PASSWORD" \
  --authenticationDatabase admin \
  --db geletrekking \
  --archive=/tmp/geletrekking-$(date +%F-%H%M).archive \
  --gzip

docker cp geletrekking-mongo:/tmp/geletrekking-$(date +%F-%H%M).archive /home/blackphoenix/backups/geletrekking/