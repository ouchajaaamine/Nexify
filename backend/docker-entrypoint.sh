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

echo "Waiting for database connection..."
until pg_isready -h postgres -p 5432 -U app -d Nexifydb > /dev/null 2>&1; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "Database connected successfully"

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

FIXTURES_MARKER="/var/www/html/var/.fixtures_loaded"
if [ ! -f "$FIXTURES_MARKER" ]; then
  echo "Checking if database has data..."
  CAMPAIGN_COUNT=$(php bin/console doctrine:query:sql "SELECT COUNT(*) FROM campaign" --quiet 2>/dev/null | tail -n 1 | tr -d ' ' 2>/dev/null || echo "0")
  
  if [ "$CAMPAIGN_COUNT" = "0" ] || [ -z "$CAMPAIGN_COUNT" ]; then
    echo "Database is empty. Loading fixtures for the first time..."
    php bin/console doctrine:fixtures:load --no-interaction
    echo "Fixtures loaded successfully"
    touch "$FIXTURES_MARKER"
  else
    echo "Database already has $CAMPAIGN_COUNT campaigns. Skipping fixtures load."
    touch "$FIXTURES_MARKER"
  fi
else
  echo "Fixtures already loaded (marker file exists). Skipping."
fi

exec php -S 0.0.0.0:8000 -t public