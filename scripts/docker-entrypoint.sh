#!/bin/sh
set -e

echo "🚀 Starting Password Manager..."

# Wait for Redis to be ready
if [ -n "$REDIS_URL" ]; then
  echo "⏳ Waiting for Redis..."
  until nc -z $(echo $REDIS_URL | sed 's|redis://||' | cut -d: -f1) $(echo $REDIS_URL | sed 's|redis://||' | cut -d: -f2); do
    echo "Redis is unavailable - sleeping"
    sleep 2
  done
  echo "✓ Redis is ready"
fi

# Run database migrations
echo "📦 Running database migrations..."
pnpm drizzle-kit push:sqlite --config=drizzle.config.main.ts || echo "⚠ Migration warning (this is OK if tables already exist)"

# Create data directories
mkdir -p /app/data/tenants

# Start the application
echo "✅ Starting application..."
exec "$@"

