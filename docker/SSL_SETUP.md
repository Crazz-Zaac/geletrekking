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

## 3) Renewal workflow (production)

Run on demand:

```bash
cd /home/blackphoenix/Documents/projects/geletrekking/docker
./scripts/renew-production-cert.sh geletrekking.com
```

Suggested cron (daily at 03:17):

```bash
17 3 * * * cd /home/blackphoenix/Documents/projects/geletrekking/docker && ./scripts/renew-production-cert.sh geletrekking.com >> /var/log/geletrekking-cert-renew.log 2>&1
```

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
