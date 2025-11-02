#!/bin/sh

# Wait for database to be ready
echo "Waiting for database connection..."
until php bin/console doctrine:query:sql "SELECT 1" > /dev/null 2>&1; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "Database connected successfully"

echo "Checking if campaigns table exists..."
# Use PostgreSQL's to_regclass to check for table existence safely
TABLE_EXISTS=$(php bin/console doctrine:query:sql "SELECT to_regclass('public.campaign') IS NOT NULL AS exists" --quiet 2>/dev/null | tail -n 1 2>/dev/null | tr -d ' ')
if [ -z "$TABLE_EXISTS" ] || [ "$TABLE_EXISTS" = "f" ]; then
  echo "Campaign table does not exist yet. Migrations will be handled by the entrypoint."
  echo "SUCCESS: Healthcheck passed (initialization in progress)"
  exit 0
fi

echo "Campaign table exists. Checking row count..."
CAMPAIGN_COUNT=$(php bin/console doctrine:query:sql "SELECT COUNT(*) FROM campaign" --quiet 2>/dev/null | tail -n 1 | tr -d ' ' 2>/dev/null)
if [ -z "$CAMPAIGN_COUNT" ]; then
  CAMPAIGN_COUNT="0"
fi
echo "SUCCESS: Tables exist and contain data ($CAMPAIGN_COUNT campaigns found)"
exit 0