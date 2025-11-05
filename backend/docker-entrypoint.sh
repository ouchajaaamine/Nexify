#!/bin/sh
set -e

if [ ! -f vendor/autoload.php ]; then
  echo "Composer dependencies not found, installing..."
  composer install --no-interaction --prefer-dist --no-scripts || composer install --no-interaction --prefer-dist --no-scripts
else
  if [ "$APP_ENV" = "dev" ]; then
    echo "Ensuring Composer dependencies are up to date (dev)..."
    composer install --no-interaction --prefer-dist --no-scripts || true
  fi
fi

# Rely on Kubernetes initContainer to ensure database readiness
echo "Skipping pg_isready wait (handled by initContainer)"

echo "Running doctrine migrations (will retry up to 5 times on failure)..."
MAX_ATTEMPTS=5
ATTEMPT=1
until [ $ATTEMPT -gt $MAX_ATTEMPTS ]
do
  echo "Migration attempt $ATTEMPT..."
  if php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration; then
    echo "Migrations completed successfully"
    break
  else
    echo "Migration attempt $ATTEMPT failed, retrying in 3s..."
    ATTEMPT=$((ATTEMPT+1))
    sleep 3
  fi
done
if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
  echo "Migrations failed after $MAX_ATTEMPTS attempts. Proceeding anyway (app may not work until migrations succeed)."
fi

echo "Starting nginx and PHP-FPM via supervisor..."
exec /usr/bin/supervisord -c /etc/supervisord.conf