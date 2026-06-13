#!/bin/sh
set -e

# Wait for MySQL to be ready
until php -r "new PDO('mysql:host=${DB_HOST};port=${DB_PORT:-3306}', '${DB_USERNAME}', '${DB_PASSWORD}');" 2>/dev/null; do
  echo "Waiting for database…"
  sleep 2
done

# Bootstrap
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php artisan storage:link --quiet 2>/dev/null || true

exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
