#!/bin/sh
# Runs from the nginx image's /docker-entrypoint.d/ at container start and
# leaves a small background watcher: when the certificate file changes (after
# an automatic renewal), it validates the config and gracefully reloads nginx.
# Reloads are zero-downtime: existing connections finish on the old workers.

CERT=/etc/nginx/certs/fullchain.pem
INTERVAL="${CERT_WATCH_INTERVAL:-300}"

checksum() { sha256sum "$CERT" 2>/dev/null | cut -d' ' -f1; }

(
  last="$(checksum)"
  while :; do
    sleep "$INTERVAL"
    current="$(checksum)"
    if [ -n "$current" ] && [ "$current" != "$last" ]; then
      if nginx -t >/dev/null 2>&1; then
        nginx -s reload && echo "[cert-watcher] certificate changed; nginx reloaded"
        last="$current"
      else
        # e.g. key and certificate briefly out of sync; retry next round.
        echo "[cert-watcher] certificate changed but config test failed; will retry"
      fi
    fi
  done
) &

echo "[cert-watcher] watching $CERT every ${INTERVAL}s"
