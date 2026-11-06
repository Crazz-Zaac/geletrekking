#!/usr/bin/env bash
# Install a Cloudflare Origin Certificate for nginx, safely.
#
#   sudo ./install-origin-cert.sh <certificate.pem> <private-key.pem>
#
# Checks that the files are a matching certificate/key pair, that the
# certificate is valid and covers geletrekking.com, backs up the current
# certificate, installs the new one, tests the nginx config and reloads
# (zero downtime). Rolls back automatically if nginx rejects it.

set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <certificate.pem> <private-key.pem>" >&2
  exit 1
fi

CERT_IN="$1"
KEY_IN="$2"
DOMAIN="${DOMAIN:-geletrekking.com}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SSL_DIR="$DOCKER_DIR/ssl"
BACKUP_DIR="$SSL_DIR/backup-$(date +%Y%m%d-%H%M%S)"

fail() { echo "ERROR: $*" >&2; exit 1; }

[[ -s "$CERT_IN" ]] || fail "certificate file '$CERT_IN' is missing or empty"
[[ -s "$KEY_IN" ]] || fail "private key file '$KEY_IN' is missing or empty"

echo "[1/5] Checking the certificate and key"
openssl x509 -in "$CERT_IN" -noout >/dev/null 2>&1 || fail "'$CERT_IN' is not a PEM certificate (copy the whole block incl. BEGIN/END lines)"
openssl pkey -in "$KEY_IN" -noout >/dev/null 2>&1 || fail "'$KEY_IN' is not a PEM private key"

cert_pub="$(openssl x509 -in "$CERT_IN" -noout -pubkey | openssl sha256)"
key_pub="$(openssl pkey -in "$KEY_IN" -pubout | openssl sha256)"
[[ "$cert_pub" == "$key_pub" ]] || fail "certificate and private key do not match"

openssl x509 -in "$CERT_IN" -noout -checkend 0 >/dev/null || fail "certificate is already expired"
openssl x509 -in "$CERT_IN" -noout -ext subjectAltName 2>/dev/null | grep -qF "DNS:$DOMAIN" \
  || fail "certificate does not cover $DOMAIN"

issuer="$(openssl x509 -in "$CERT_IN" -noout -issuer)"
echo "      issuer:  ${issuer#issuer=}"
echo "      expires: $(openssl x509 -in "$CERT_IN" -noout -enddate | cut -d= -f2)"
echo "      names:   $(openssl x509 -in "$CERT_IN" -noout -ext subjectAltName | tail -n +2 | xargs)"
grep -qi "cloudflare" <<<"$issuer" || echo "      note: issuer is not Cloudflare Origin CA; continuing anyway"

echo "[2/5] Backing up the current certificate to $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -p "$SSL_DIR/fullchain.pem" "$SSL_DIR/privkey.pem" "$BACKUP_DIR/" 2>/dev/null || true
chmod 700 "$BACKUP_DIR"

echo "[3/5] Installing (key first, atomically)"
install -m 600 "$KEY_IN" "$SSL_DIR/.privkey.pem.tmp" && mv -f "$SSL_DIR/.privkey.pem.tmp" "$SSL_DIR/privkey.pem"
install -m 644 "$CERT_IN" "$SSL_DIR/.fullchain.pem.tmp" && mv -f "$SSL_DIR/.fullchain.pem.tmp" "$SSL_DIR/fullchain.pem"

echo "[4/5] Testing nginx configuration"
cd "$DOCKER_DIR"
if ! docker compose exec -T nginx nginx -t; then
  echo "nginx rejected the new certificate; restoring the previous one" >&2
  cp -p "$BACKUP_DIR/fullchain.pem" "$BACKUP_DIR/privkey.pem" "$SSL_DIR/"
  exit 1
fi

echo "[5/5] Reloading nginx (zero downtime)"
docker compose exec -T nginx nginx -s reload

echo
echo "Done. Next: in Cloudflare set SSL/TLS encryption mode to 'Full (strict)'."
echo "Previous certificate kept in $BACKUP_DIR (delete it once everything works)."
