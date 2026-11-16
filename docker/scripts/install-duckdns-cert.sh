#!/usr/bin/env bash
# Certbot deploy hook for the old geletrekking.duckdns.org address.
# That name only redirects to geletrekking.com, but it still needs a valid
# certificate so browsers and Google can follow the redirect over https.
# Copies the renewed certificate to where nginx reads it and reloads nginx.
set -euo pipefail

SRC=/etc/letsencrypt/live/geletrekking.duckdns.org
DEST=/home/blackphoenix/geletrekking/docker/ssl/duckdns

# Certbot runs deploy hooks for every renewed certificate; only act on this one.
if [ -n "${RENEWED_LINEAGE:-}" ] && [ "$RENEWED_LINEAGE" != "$SRC" ]; then exit 0; fi

install -d -m 755 "$DEST"
install -m 644 "$SRC/fullchain.pem" "$DEST/fullchain.pem"
install -m 600 "$SRC/privkey.pem" "$DEST/privkey.pem"

if docker exec geletrekking-nginx nginx -t >/dev/null 2>&1; then
  docker exec geletrekking-nginx nginx -s reload
  echo "[duckdns-cert] installed and nginx reloaded"
else
  echo "[duckdns-cert] installed, but the nginx config test failed; not reloaded" >&2
fi
