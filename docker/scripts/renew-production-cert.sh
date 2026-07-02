#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <primary_domain>"
  echo "Example: $0 geletrekking.com"
  exit 1
fi

PRIMARY_DOMAIN="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$DOCKER_DIR"

echo "[1/3] Running certbot renew"
docker compose --profile prod run --rm certbot renew --webroot -w /var/www/certbot

echo "[2/3] Exporting latest certificate for nginx"
docker compose --profile prod run --rm --entrypoint sh certbot -lc "cp /etc/letsencrypt/live/$PRIMARY_DOMAIN/fullchain.pem /etc/nginx/certs/fullchain.pem && cp /etc/letsencrypt/live/$PRIMARY_DOMAIN/privkey.pem /etc/nginx/certs/privkey.pem"

echo "[3/3] Reloading nginx"
docker compose exec nginx nginx -s reload

echo "Renewal flow completed for: $PRIMARY_DOMAIN"
