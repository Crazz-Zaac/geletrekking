#!/bin/sh

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
until nc -z mongo 27017; do
  echo "MongoDB is unavailable - sleeping"
  sleep 2
done

echo "MongoDB is up!"

# Run the superadmin seeder
echo "Running superadmin seeder..."
node superadminSeeder.js

# Start the server
echo "Starting server..."
exec node server.js