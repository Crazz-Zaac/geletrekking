#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <domains_csv> <email> [--staging]"
  echo "Example: $0 geletrekking.com,www.geletrekking.com admin@geletrekking.com"
  exit 1
fi

DOMAINS_CSV="$1"
EMAIL="$2"
STAGING_FLAG="${3:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SSL_DIR="$DOCKER_DIR/ssl"

mkdir -p "$SSL_DIR"

IFS=',' read -r -a DOMAIN_ARRAY <<< "$DOMAINS_CSV"
PRIMARY_DOMAIN="${DOMAIN_ARRAY[0]}"

DOMAIN_ARGS=()
for domain in "${DOMAIN_ARRAY[@]}"; do
  DOMAIN_ARGS+=("-d" "$domain")
done

STAGING_ARG=()
if [[ "$STAGING_FLAG" == "--staging" ]]; then
  STAGING_ARG+=("--staging")
fi

echo "[1/5] Ensuring temporary cert exists so nginx can start"
if [[ ! -f "$SSL_DIR/fullchain.pem" || ! -f "$SSL_DIR/privkey.pem" ]]; then
  docker run --rm \
    -v "$SSL_DIR:/certs" \
    alpine:3.20 sh -lc "apk add --no-cache openssl >/dev/null && openssl req -x509 -nodes -newkey rsa:2048 -days 1 -keyout /certs/privkey.pem -out /certs/fullchain.pem -subj '/CN=localhost'"
fi

echo "[2/5] Starting nginx for ACME challenge"
cd "$DOCKER_DIR"
docker compose up -d nginx

echo "[3/5] Requesting Let's Encrypt certificate for: $DOMAINS_CSV"
docker compose run --rm --profile prod certbot certonly \
  --webroot \
  -w /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --rsa-key-size 4096 \
  "${DOMAIN_ARGS[@]}" \
  "${STAGING_ARG[@]}"

echo "[4/5] Exporting issued certificate for nginx"
docker compose run --rm --profile prod certbot sh -lc "cp /etc/letsencrypt/live/$PRIMARY_DOMAIN/fullchain.pem /etc/nginx/certs/fullchain.pem && cp /etc/letsencrypt/live/$PRIMARY_DOMAIN/privkey.pem /etc/nginx/certs/privkey.pem"

echo "[5/5] Reloading nginx with the new certificate"
docker compose exec nginx nginx -s reload

echo "Done. HTTPS certificate is active for: $DOMAINS_CSV"
