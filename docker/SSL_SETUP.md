# HTTPS / SSL Setup

This stack terminates TLS at the `nginx` service and supports both local self-signed certs and production Let's Encrypt certificates.

## 1) Local development (self-signed)

```bash
mkdir -p /home/blackphoenix/Documents/projects/geletrekking/docker/ssl
docker run --rm -v /home/blackphoenix/Documents/projects/geletrekking/docker/ssl:/certs alpine:3.20 sh -lc "apk add --no-cache openssl >/dev/null && openssl req -x509 -nodes -newkey rsa:2048 -days 365 -keyout /certs/privkey.pem -out /certs/fullchain.pem -subj '/C=NP/ST=Bagmati/L=Kathmandu/O=Gele Trekking/CN=localhost'"

cd /home/blackphoenix/Documents/projects/geletrekking/docker
docker compose up -d --build
```

Endpoints:
- `https://localhost` (self-signed)
- `http://localhost` (301 redirect to HTTPS)

---

## 2) Production (Let's Encrypt) — one-time issuance

Prerequisites:
- DNS for your domain points to this server.
- Ports `80` and `443` are publicly reachable.

Issue certs using the helper script:

```bash
cd /home/blackphoenix/Documents/projects/geletrekking/docker
chmod +x scripts/issue-production-cert.sh scripts/renew-production-cert.sh
chmod +x scripts/check-ssl-health.sh

# domains CSV + email
./scripts/issue-production-cert.sh geletrekking.com,www.geletrekking.com admin@geletrekking.com
```

For first-time testing against Let's Encrypt staging:

```bash
./scripts/issue-production-cert.sh geletrekking.com,www.geletrekking.com admin@geletrekking.com --staging
```

---

## 3) Production: Cloudflare Origin Certificate (current setup)

All traffic reaches the server through Cloudflare, so the origin uses a
**Cloudflare Origin Certificate** (valid up to 15 years, trusted only by
Cloudflare). No renewal jobs are needed.

Install or replace it:

1. Cloudflare → **SSL/TLS → Origin Server → Create Certificate**
   (RSA 2048; hostnames `geletrekking.com`, `*.geletrekking.com`; 15 years).
2. Save the two PEM blocks on the server, e.g. `~/origin-cert.pem` and `~/origin-key.pem`.
3. `cd ~/geletrekking/docker && sudo ./scripts/install-origin-cert.sh ~/origin-cert.pem ~/origin-key.pem`
   (validates the pair, backs up the old one, reloads nginx with zero downtime, rolls back on error).
4. Cloudflare → **SSL/TLS → Overview → Full (strict)**.
5. Delete the copies in your home directory (`shred -u ~/origin-*.pem`).

Monitoring: `backend/cron/sslMonitor.js` checks the certificate nginx serves
daily at 09:00 Nepal time and emails `SSL_ALERT_EMAIL` (default
`SUPERADMIN_EMAIL`) when 21 days or fewer remain. The admin dashboard shows the
same status. nginx also reloads by itself within 5 minutes if `ssl/fullchain.pem`
changes (`nginx/40-cert-reload-watcher.sh`).

**Important:** an Origin Certificate only works while Cloudflare proxying
(orange cloud) is on. If you ever turn proxying off, switch back to Let's
Encrypt first (section 2 and `scripts/renew-production-cert.sh`) and remove the
Cloudflare-only firewall rule (`scripts/cloudflare-firewall.sh remove`).

---

## 4) Security notes
- Quick SSL health check (defaults to 30-day warning window):

```bash
cd /home/blackphoenix/Documents/projects/geletrekking/docker
./scripts/check-ssl-health.sh
```

- Real certificates and private keys in `docker/ssl/` are ignored by Git.
- Keep server access restricted and rotate credentials periodically.
- Use HSTS only when you are sure HTTPS is stable in production.
