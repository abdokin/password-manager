#!/bin/bash

set -e

echo "🔐 Generating secure secrets..."

# Generate Rails secret key base
RAILS_SECRET=$(bundle exec rails secret 2>/dev/null || openssl rand -hex 64)
JWT_SECRET=$(openssl rand -hex 32)

echo ""
echo "Generated secrets (add these to your .env files):"
echo ""
echo "Backend (.env):"
echo "SECRET_KEY_BASE=$RAILS_SECRET"
echo "JWT_SECRET_KEY=$JWT_SECRET"
echo ""
echo "⚠️  Keep these secrets secure and never commit them to version control!"

