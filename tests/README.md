# Test Suite

This directory contains comprehensive tests for the password manager application. Tests are organized by feature and focus on functionality rather than UI.

## Test Structure

```
tests/
├── setup.ts                    # Test setup and teardown
├── utils/
│   └── test-db.ts              # Test database utilities
├── encryption.test.ts          # Password encryption/decryption tests
├── auth.test.ts                # Authentication and user management tests
├── auth-adapter.test.ts        # NextAuth adapter tests
├── organization.test.ts        # Organization CRUD tests
├── organization-actions.test.ts # Organization business logic tests
├── password.test.ts            # Password management tests
├── tenant-db.test.ts           # Multi-tenant database tests
├── email-queue.test.ts         # Email queue system tests
└── import-export.test.ts       # Import/export functionality tests
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with UI
pnpm test:ui

# Run tests once (CI mode)
pnpm test:run

# Run tests with coverage
pnpm test:coverage
```

## Test Coverage

### ✅ Encryption (`encryption.test.ts`)

- Password encryption and decryption
- Key derivation
- Salt generation
- Error handling

### ✅ Authentication (`auth.test.ts`, `auth-adapter.test.ts`)

- User creation
- Email verification
- Verification tokens
- NextAuth adapter integration

### ✅ Organizations (`organization.test.ts`, `organization-actions.test.ts`)

- Organization creation
- Member management
- Role management
- Subscription plans
- Member limits

### ✅ Passwords (`password.test.ts`)

- Password CRUD operations
- Encryption/decryption
- Categories
- Password history

### ✅ Multi-Tenancy (`tenant-db.test.ts`)

- Tenant database creation
- Data isolation
- Database cleanup

### ✅ Email Queue (`email-queue.test.ts`)

- Job queuing
- In-memory fallback
- Error handling

### ✅ Import/Export (`import-export.test.ts`)

- JSON export/import
- CSV export/import
- Data validation

## Test Database

Tests use separate test databases:

- `test-main.db` - Main database for testing
- `test-tenants/` - Directory for tenant databases

These are automatically cleaned up before and after tests.

## Writing New Tests

1. Create a new test file in `tests/` directory
2. Import test utilities from `tests/utils/test-db.ts`
3. Use `beforeEach` to set up test data
4. Use `cleanupTestDb()` to clean up between tests
5. Follow the existing test patterns

Example:

```typescript
import { beforeEach, describe, expect, it } from "vitest";

import { cleanupTestDb, createTestMainDb } from "./utils/test-db";

describe("My Feature", () => {
  beforeEach(() => {
    cleanupTestDb();
  });

  it("should do something", async () => {
    const testDb = createTestMainDb();
    // Your test code
  });
});
```

## Notes

- Tests use isolated test databases
- No UI testing (as requested)
- Focus on business logic and functionality
- All tests are independent and can run in parallel
- Test databases are cleaned up automatically
