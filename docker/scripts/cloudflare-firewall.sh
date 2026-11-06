#!/usr/bin/env bash
# Allow HTTPS (443) to the origin only from Cloudflare, so nobody can bypass
# Cloudflare's WAF/DDoS protection by connecting to the server IP directly.
# Port 80 stays open: it only redirects to HTTPS and serves Let's Encrypt
# HTTP-01 challenges for certificate renewal.
#
#   sudo ./cloudflare-firewall.sh apply    # add/refresh the rules (idempotent)
#   sudo ./cloudflare-firewall.sh remove   # undo everything (emergency)
#   sudo ./cloudflare-firewall.sh status
#
# IPv4: Docker DNATs published ports, so traffic goes through the FORWARD
#       chain and bypasses UFW. Rules go in Docker's DOCKER-USER chain.
# IPv6: handled by docker-proxy on the host (INPUT chain), so UFW applies.
#
# IMPORTANT: if Cloudflare proxying (orange cloud) is ever turned off for the
# domain, run "remove" or the site will be unreachable over HTTPS.
# Ranges from https://www.cloudflare.com/ips/ (update if Cloudflare changes them).

set -euo pipefail

CHAIN="CF-HTTPS-ONLY"

CF_IPV4=(
  173.245.48.0/20 103.21.244.0/22 103.22.200.0/22 103.31.4.0/22
  141.101.64.0/18 108.162.192.0/18 190.93.240.0/20 188.114.96.0/20
  197.234.240.0/22 198.41.128.0/17 162.158.0.0/15 104.16.0.0/13
  104.24.0.0/14 172.64.0.0/13 131.0.72.0/22
)
CF_IPV6=(
  2400:cb00::/32 2606:4700::/32 2803:f800::/32 2405:b500::/32
  2405:8100::/32 2a06:98c0::/29 2c0f:f248::/32
)

# Only connections arriving on the public interface. Without "-i", this would
# also match the containers' own OUTGOING HTTPS (e.g. image optimization,
# Google Fonts at build time) and drop it.
PUBLIC_IFACE="${PUBLIC_IFACE:-$(ip route show default | awk '{print $5; exit}')}"
JUMP=(-i "$PUBLIC_IFACE" -p tcp -m conntrack --ctorigdstport 443 --ctdir ORIGINAL -j "$CHAIN")
# Pre-fix rule (no interface match); removed on apply/remove if present.
OLD_JUMP=(-p tcp -m conntrack --ctorigdstport 443 --ctdir ORIGINAL -j "$CHAIN")

apply_ipv4() {
  # Wait for Docker to create DOCKER-USER (at boot).
  for _ in $(seq 1 30); do
    iptables -n -L DOCKER-USER >/dev/null 2>&1 && break
    sleep 2
  done

  while iptables -C DOCKER-USER "${OLD_JUMP[@]}" 2>/dev/null; do
    iptables -D DOCKER-USER "${OLD_JUMP[@]}"
  done

  iptables -N "$CHAIN" 2>/dev/null || iptables -F "$CHAIN"
  for range in "${CF_IPV4[@]}"; do
    iptables -A "$CHAIN" -s "$range" -j RETURN
  done
  iptables -A "$CHAIN" -j DROP

  iptables -C DOCKER-USER "${JUMP[@]}" 2>/dev/null || iptables -I DOCKER-USER 1 "${JUMP[@]}"
}

remove_ipv4() {
  while iptables -C DOCKER-USER "${JUMP[@]}" 2>/dev/null; do
    iptables -D DOCKER-USER "${JUMP[@]}"
  done
  while iptables -C DOCKER-USER "${OLD_JUMP[@]}" 2>/dev/null; do
    iptables -D DOCKER-USER "${OLD_JUMP[@]}"
  done
  iptables -F "$CHAIN" 2>/dev/null || true
  iptables -X "$CHAIN" 2>/dev/null || true
}

apply_ipv6() {
  for range in "${CF_IPV6[@]}"; do
    ufw allow proto tcp from "$range" to any port 443 comment 'Cloudflare HTTPS' >/dev/null
  done
  # Drop the generic "443 from anywhere" rule (IPv4 part is irrelevant: Docker bypasses UFW).
  ufw --force delete allow 443 >/dev/null 2>&1 || true
}

remove_ipv6() {
  ufw allow 443 >/dev/null
  for range in "${CF_IPV6[@]}"; do
    ufw --force delete allow proto tcp from "$range" to any port 443 >/dev/null 2>&1 || true
  done
}

case "${1:-}" in
  apply)
    apply_ipv4
    apply_ipv6
    echo "Cloudflare-only HTTPS firewall applied."
    ;;
  apply-ipv4)
    # Used by the systemd unit at boot (UFW rules persist on their own).
    apply_ipv4
    ;;
  remove)
    remove_ipv4
    remove_ipv6
    echo "Cloudflare-only HTTPS firewall removed; 443 is open to everyone again."
    ;;
  status)
    iptables -S DOCKER-USER
    iptables -S "$CHAIN" 2>/dev/null | head -3 || echo "($CHAIN not present)"
    ufw status | grep -E '443' || true
    ;;
  *)
    echo "Usage: $0 {apply|remove|status}" >&2
    exit 1
    ;;
esac
