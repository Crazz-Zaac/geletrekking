# Setup a cron job to backup the MongoDB database every day at 2 AM


```shell
crontab -e
```

```shell
0 2 * * * set -a; . /home/blackphoenix/geletrekking/backend/.env; set +a; /home/blackphoenix/geletrekking/docker/scripts/backup-mongo.sh >> /home/blackphoenix/backups/geletrekking/backup.log 2>&1
```