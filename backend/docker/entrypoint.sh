#!/bin/sh
set -e

# Default port (Railway injects $PORT; fall back to 80 locally)
export PORT="${PORT:-80}"

# Write nginx config with the actual port substituted in
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Bootstrap Laravel (env vars are available at runtime)
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link --quiet 2>/dev/null || true

exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
