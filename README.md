# Password Manager - SaaS Multi-Tenant Application

A production-ready, secure password manager built with Next.js 14, featuring multi-tenancy, team management, and enterprise-grade security.

## Features

- 🔐 **Magic Link Authentication** - Passwordless login via email
- 🔒 **2-Factor Authentication (2FA)** - Enhanced security with TOTP
- 🏢 **Multi-Tenancy** - Separate databases per organization
- 👥 **Team Management** - Roles, invitations, and permissions
- 🔑 **AES-256-GCM Encryption** - Military-grade password encryption
- 📧 **Background Jobs** - BullMQ with Redis for async email processing
- 📊 **Password History** - Track password changes over time
- 📁 **Categories** - Organize passwords by category
- 📤 **Import/Export** - CSV and JSON support
- 🎨 **Modern UI** - Beautiful, responsive interface
- 🐳 **Docker Ready** - Full containerization support
- 🔄 **Traefik Integration** - Automatic SSL, load balancing, and routing

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite with Drizzle ORM (multi-tenant)
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Encryption**: AES-256-GCM with PBKDF2 key derivation
- **Queue System**: BullMQ with Redis
- **Email**: React Email templates with Nodemailer
- **Reverse Proxy**: Traefik with Let's Encrypt
- **Styling**: Tailwind CSS
- **Validation**: Zod

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet / Users                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Traefik Reverse Proxy (Port 80/443)            │
│  • Automatic SSL/TLS (Let's Encrypt)                        │
│  • Security Headers Middleware                               │
│  • Rate Limiting (100 req/min)                              │
│  • Compression                                               │
│  • Load Balancing                                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         Next.js Application (Port 3000)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  App Router (Next.js 14)                              │  │
│  │  • Server Components                                  │  │
│  │  • Server Actions                                     │  │
│  │  • API Routes                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Authentication Layer                                 │  │
│  │  • NextAuth.js v5 (Magic Link)                        │  │
│  │  • 2FA Support (TOTP)                                 │  │
│  │  • Session Management (JWT)                           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Business Logic Layer                                 │  │
│  │  • Organization Management                           │  │
│  │  • Password CRUD Operations                          │  │
│  │  • Category Management                               │  │
│  │  • Import/Export                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Encryption Layer                                     │  │
│  │  • AES-256-GCM Encryption                            │  │
│  │  • PBKDF2 Key Derivation (100k iterations)           │  │
│  │  • Master Key Management                             │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────────┐ ┌──────────┐ ┌──────────────┐
│  Main Database  │ │  Redis   │ │ Email Queue  │
│  (sqlite.db)    │ │ (Queue)  │ │  (BullMQ)    │
│                 │ │          │ │              │
│ • Users         │ │ • Jobs   │ │ • Magic Link │
│ • Organizations │ │ • Cache  │ │ • 2FA Codes  │
│ • Members       │ │          │ │ • Welcome    │
│ • Invitations   │ │          │ │              │
└─────────────────┘ └──────────┘ └──────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│         Tenant Databases (data/tenants/)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ tenant-1.db  │  │ tenant-2.db  │  │ tenant-N.db  │    │
│  │              │  │              │  │              │    │
│  │ • Passwords  │  │ • Passwords  │  │ • Passwords  │    │
│  │ • Categories │  │ • Categories │  │ • Categories │    │
│  │ • History    │  │ • History    │  │ • History    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  One database per organization (complete isolation)        │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Tenant Architecture

#### Database Structure

1. **Main Database** (`sqlite.db`)
   - **Purpose**: Shared across all tenants
   - **Contains**:
     - Users (authentication, 2FA settings)
     - Organizations (metadata, subscription plans)
     - Organization Members (user-org relationships, roles)
     - Organization Invitations (pending invites)
     - Verification Tokens (magic links)
   - **Location**: Root directory
   - **Schema**: Defined in `data/schema.ts`

2. **Tenant Databases** (`data/tenants/tenant-{orgId}.db`)
   - **Purpose**: Complete data isolation per organization
   - **Contains**:
     - Passwords (encrypted, user-specific)
     - Categories (organization-wide)
     - Password History (audit trail)
     - Shared Passwords (cross-user sharing)
   - **Location**: `data/tenants/` directory
   - **Schema**: Defined in `data/tenant-schema.ts`
   - **Creation**: Automatic when organization is created

#### Data Flow

```
User Request
    │
    ▼
Middleware (tenant-context.ts)
    │ • Validates session
    │ • Gets current organization ID
    │ • Sets tenant context
    ▼
Server Action (tenant-actions.ts)
    │ • Validates permissions
    │ • Gets tenant database connection
    │ • Performs operation
    ▼
Tenant Database (tenant-{orgId}.db)
    │ • Encrypted password storage
    │ • Category management
    │ • History tracking
    ▼
Response (encrypted data)
```

### Security Architecture

#### Encryption Flow

```
User Password Input
    │
    ▼
Master Encryption Key (from env)
    │
    ▼
PBKDF2 Key Derivation
    │ • 100,000 iterations
    │ • SHA-512 hash
    │ • 32-byte key
    ▼
AES-256-GCM Encryption
    │ • Random salt (64 bytes)
    │ • Random IV (16 bytes)
    │ • Authentication tag (16 bytes)
    ▼
Encrypted Password Storage
    │ Format: salt:iv:tag:encryptedData (base64)
    ▼
Tenant Database
```

#### Authentication Flow

```
1. User enters email
    │
    ▼
2. NextAuth EmailProvider
    │ • Creates verification token
    │ • Queues email job
    ▼
3. Background Worker (BullMQ)
    │ • Processes email queue
    │ • Renders React Email template
    │ • Sends via SMTP
    ▼
4. User clicks magic link
    │
    ▼
5. Token verification
    │ • Validates token
    │ • Creates/updates user
    │ • Generates JWT session
    ▼
6. Optional 2FA
    │ • TOTP verification
    │ • QR code generation
    ▼
7. Authenticated Session
```

### Application Layers

#### 1. Presentation Layer (`app/`, `components/`)

- **Next.js App Router**: Server and client components
- **UI Components**: Reusable React components (shadcn/ui)
- **Pages**: Route handlers and page components
- **API Routes**: RESTful endpoints

#### 2. Business Logic Layer (`lib/`)

- **Organization Management** (`lib/organization.ts`): CRUD operations
- **Password Actions** (`lib/tenant-actions.ts`): Tenant-aware password operations
- **Category Management** (`lib/tenant-categories.ts`): Category CRUD
- **Import/Export** (`lib/tenant-import-export.ts`): Data migration
- **Billing** (`lib/billing.ts`): Subscription management

#### 3. Data Access Layer (`data/`)

- **Schema Definitions**: Drizzle ORM schemas
- **Database Connections**: Main and tenant DB management
- **Migrations**: Database schema versioning

#### 4. Infrastructure Layer

- **Encryption** (`lib/encryption.ts`): Cryptographic operations
- **Email** (`lib/email.ts`, `lib/email-service.ts`): Email sending
- **Queue** (`lib/jobs/queue.ts`): Background job processing
- **Authentication** (`lib/auth.ts`, `lib/auth-email-adapter.ts`): Auth logic

### Deployment Architecture

#### Production Stack (Docker Compose)

```
┌─────────────────────────────────────────────────────────┐
│  Traefik Container                                      │
│  • Port 80 (HTTP → HTTPS redirect)                    │
│  • Port 443 (HTTPS with Let's Encrypt)                 │
│  • Port 8080 (Dashboard, optional)                     │
└─────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  App         │ │  Worker      │ │  Redis       │
│  Container   │ │  Container   │ │  Container   │
│              │ │              │ │              │
│ • Next.js    │ │ • BullMQ     │ │ • Job Queue  │
│ • Port 3000  │ │ • Email      │ │ • Cache      │
│ (internal)  │ │ • Processing │ │ (internal)   │
└──────────────┘ └──────────────┘ └──────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  Volumes                                                 │
│  • ./data → /app/data (tenant databases)                │
│  • ./sqlite.db → /app/sqlite.db (main database)        │
│  • traefik-letsencrypt (SSL certificates)               │
└─────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Multi-Tenant Isolation**: Separate databases ensure complete data isolation
2. **Magic Link Auth**: Passwordless authentication reduces attack surface
3. **AES-256-GCM**: Authenticated encryption prevents tampering
4. **Background Jobs**: Async email processing improves response times
5. **Traefik**: Automatic SSL and service discovery simplify operations
6. **SQLite**: Lightweight, file-based databases perfect for multi-tenancy
7. **Server Actions**: Type-safe server-side operations with Next.js

## Quick Start

### Development

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations
pnpm migrate

# Start development server
pnpm dev:all
```

Access at `http://localhost:3000`

### Production with Docker

```bash
# Configure environment
cp .env.example .env
# Edit .env with production values:
# - DOMAIN=your-domain.com
# - ACME_EMAIL=your-email@example.com
# - Generate secrets for NEXTAUTH_SECRET and MASTER_ENCRYPTION_KEY

# Build and start
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Configuration

### Environment Variables

See `.env.example` for all required variables:

- `DOMAIN` - Your domain name (for Traefik SSL)
- `ACME_EMAIL` - Email for Let's Encrypt certificates
- `NEXTAUTH_SECRET` - Secret for NextAuth (min 32 chars)
- `MASTER_ENCRYPTION_KEY` - Master encryption key (min 32 chars)
- `SMTP_*` - Email server configuration
- `REDIS_URL` - Redis connection (optional)

### Traefik Setup

Traefik is automatically configured via Docker labels. See [TRAEFIK_SETUP.md](./TRAEFIK_SETUP.md) for detailed configuration.

Key features:

- Automatic SSL/TLS with Let's Encrypt
- Security headers middleware
- Rate limiting (100 req/min)
- Compression
- Dashboard (optional, protected)

## Testing

```bash
# Run all tests
pnpm test:run

# Watch mode
pnpm test

# With UI
pnpm test:ui

# Coverage
pnpm test:coverage
```

See [tests/README.md](./tests/README.md) for test documentation.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide.

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [TRAEFIK_SETUP.md](./TRAEFIK_SETUP.md) - Traefik configuration guide
- [MULTI_TENANT_SETUP.md](./MULTI_TENANT_SETUP.md) - Multi-tenancy architecture
- [tests/README.md](./tests/README.md) - Test suite documentation

## License

MIT
