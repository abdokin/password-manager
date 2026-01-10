#!/bin/bash
set -e

echo "🔧 Setting up Password Manager..."

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "⚠️  Please update .env with your configuration"
fi

# Generate secrets if not set
if ! grep -q "NEXTAUTH_SECRET=.*[a-zA-Z0-9]\{32,\}" .env 2>/dev/null; then
  echo "🔑 Generating NEXTAUTH_SECRET..."
  SECRET=$(openssl rand -base64 32 | tr -d '\n')
  sed -i.bak "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=$SECRET/" .env
  rm -f .env.bak
fi

if ! grep -q "MASTER_ENCRYPTION_KEY=.*[a-zA-Z0-9]\{32,\}" .env 2>/dev/null; then
  echo "🔑 Generating MASTER_ENCRYPTION_KEY..."
  KEY=$(openssl rand -base64 32 | tr -d '\n')
  sed -i.bak "s/MASTER_ENCRYPTION_KEY=.*/MASTER_ENCRYPTION_KEY=$KEY/" .env
  rm -f .env.bak
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Create data directories
echo "📁 Creating data directories..."
mkdir -p data/tenants

# Run migrations
echo "🗄️  Running database migrations..."
pnpm drizzle-kit push:sqlite --config=drizzle.config.main.ts || echo "⚠️  Migration warning (this is OK if tables already exist)"

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  Landing Page: pnpm dev"
echo "  Backend:     cd backend && rails server"
echo "  Frontend:    cd frontend && pnpm dev"

