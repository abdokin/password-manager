#!/bin/bash

set -e

echo "🚀 Setting up Password Manager development environment..."

# Check for required tools
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Abort." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Abort." >&2; exit 1; }

# Backend setup
echo "📦 Setting up backend..."
cd backend

if [ ! -f .env ]; then
  echo "📝 Creating backend .env from .env.example..."
  cp .env.example .env
  echo "⚠️  Please update backend/.env with your configuration"
fi

if [ ! -f Gemfile.lock ]; then
  echo "📥 Installing Ruby dependencies..."
  bundle install
fi

# Frontend setup
echo "📦 Setting up frontend..."
cd ../frontend

if [ ! -f .env ]; then
  echo "📝 Creating frontend .env from .env.example..."
  cp .env.example .env
  echo "⚠️  Please update frontend/.env with your configuration"
fi

if [ ! -d node_modules ]; then
  echo "📥 Installing Node dependencies..."
  npm install
fi

cd ..

# Docker setup
echo "🐳 Setting up Docker services..."
docker-compose up -d db redis

echo "⏳ Waiting for services to be ready..."
sleep 5

# Database setup
echo "🗄️  Setting up database..."
cd backend
bundle exec rails db:create db:migrate

cd ..

echo "✅ Development environment setup complete!"
echo ""
echo "To start the application:"
echo "  Backend:  cd backend && bundle exec rails server"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "Or use Docker Compose:"
echo "  docker-compose up"

