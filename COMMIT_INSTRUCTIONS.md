# Commit Instructions

## Prerequisites

1. **Set Git Identity** (required before committing):
```bash
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

## Commit Groups

Commit changes in logical groups with descriptive one-line messages:

### 1. Architecture Documentation
```bash
git add README.md
git commit -m "docs: add comprehensive architecture documentation to README"
```

### 2. Traefik Integration
```bash
git add traefik.yml traefik-dynamic.yml TRAEFIK_SETUP.md docker-compose.prod.yml
git commit -m "feat: replace nginx with Traefik reverse proxy and SSL automation"
```

### 3. CI/CD Setup
```bash
git add .github/workflows/ci.yml .prettierrc .prettierignore package.json pnpm-lock.yaml
git commit -m "ci: add GitHub Actions workflow for linting, formatting, and testing"
```

### 4. Test Suite
```bash
git add tests/ vitest.config.ts
git commit -m "test: add comprehensive test suite for all features"
```

### 5. Configuration Updates
```bash
git add .gitignore DEPLOYMENT.md
git commit -m "chore: update deployment docs and gitignore for Traefik"
```

### 6. Code Formatting and Fixes
```bash
git add app/ components/ lib/ data/ middleware.ts
git commit -m "fix: resolve linting errors and format codebase"
```

## Push to Branch

After all commits:
```bash
git push origin feature/traefik-ci-cd
```

## Verify Before Pushing

```bash
# Check linting (some warnings are acceptable)
pnpm lint

# Check formatting
pnpm format:check

# Run tests
pnpm test:run

# Build
pnpm build
```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) will automatically:
- ✅ Run ESLint on every push/PR
- ✅ Check code formatting with Prettier
- ✅ Run test suite with Vitest
- ✅ Build the Next.js application
- ✅ Build Docker image

All checks must pass before merging to main branch.
