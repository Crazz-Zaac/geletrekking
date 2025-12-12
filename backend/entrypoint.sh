#!/bin/sh
set -e

echo " Running Super Admin Seeder..."
node superadminSeeder.js

echo "Seeder done. Starting API server..."
exec node server.js
