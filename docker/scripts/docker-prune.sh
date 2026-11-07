#!/usr/bin/env bash
# Weekly Docker cleanup: removes old build cache and images left behind by
# `docker compose up --build`. Running containers, their images and named
# volumes (including MongoDB data) are never touched.

set -euo pipefail

# Keep up to 5 GB of recent build cache so the next rebuild stays fast.
/usr/bin/docker builder prune -af --max-used-space 5gb >/dev/null
# Remove unused images older than 7 days (keeps a recent one to roll back to).
/usr/bin/docker image prune -af --filter "until=168h" >/dev/null

# Keep cron log files short (last 500 lines each).
for log in /home/blackphoenix/backups/geletrekking/backup.log /home/blackphoenix/backups/geletrekking/docker-prune.log; do
  if [ -f "$log" ]; then tail -n 500 "$log" > "$log.tmp" && mv "$log.tmp" "$log"; fi
done

echo "$(date '+%Y-%m-%d %H:%M:%S') Docker prune done. $(df -h / | awk 'NR==2 {print $4 " free on /"}')"
