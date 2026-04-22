#!/usr/bin/env bash
set -euo pipefail

WARNING_DAYS="${1:-30}"

if ! [[ "$WARNING_DAYS" =~ ^[0-9]+$ ]]; then
  echo "Usage: $0 [warning_days]"
  echo "Example: $0 30"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SSL_CERT="$DOCKER_DIR/ssl/fullchain.pem"

if [[ ! -f "$SSL_CERT" ]]; then
  echo "SSL status: missing"
  echo "Certificate file not found at: $SSL_CERT"
  exit 2
fi

SECONDS_WINDOW=$((WARNING_DAYS * 24 * 60 * 60))

docker run --rm -v "$DOCKER_DIR/ssl:/certs:ro" alpine:3.20 sh -lc "
  apk add --no-cache openssl >/dev/null

  if ! openssl x509 -in /certs/fullchain.pem -noout >/dev/null 2>&1; then
    echo 'SSL status: invalid'
    exit 3
  fi

  if openssl x509 -in /certs/fullchain.pem -noout -checkend 0 >/dev/null 2>&1; then
    if openssl x509 -in /certs/fullchain.pem -noout -checkend $SECONDS_WINDOW >/dev/null 2>&1; then
      echo 'SSL status: valid'
    else
      echo 'SSL status: expiring-soon'
    fi
  else
    echo 'SSL status: expired'
  fi

  echo '--- certificate details ---'
  openssl x509 -in /certs/fullchain.pem -noout -subject -issuer -dates -serial -fingerprint -sha256
"