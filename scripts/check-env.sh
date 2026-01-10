#!/bin/bash

set -e

echo "🔍 Checking environment configuration..."

ERRORS=0

check_file() {
  if [ ! -f "$1" ]; then
    echo "❌ Missing: $1"
    echo "   Run: cp $1.example $1"
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ Found: $1"
  fi
}

check_var() {
  if grep -q "^$1=$" "$2" 2>/dev/null || ! grep -q "^$1=" "$2" 2>/dev/null; then
    echo "⚠️  Unset or empty: $1 in $2"
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ Set: $1 in $2"
  fi
}

# Check backend .env
echo ""
echo "Backend environment:"
check_file "backend/.env"

if [ -f "backend/.env" ]; then
  if [ "$RAILS_ENV" != "test" ]; then
    check_var "SECRET_KEY_BASE" "backend/.env"
    check_var "DATABASE_URL" "backend/.env"
  fi
fi

# Check frontend .env
echo ""
echo "Frontend environment:"
check_file "frontend/.env"

if [ -f "frontend/.env" ]; then
  check_var "VITE_API_URL" "frontend/.env"
fi

# Check root .env
echo ""
echo "Root environment:"
if [ -f ".env" ]; then
  echo "✅ Found: .env"
else
  echo "ℹ️  Optional: .env (not required)"
fi

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "✅ All environment files are properly configured!"
  exit 0
else
  echo "❌ Found $ERRORS issue(s). Please fix them before continuing."
  exit 1
fi

