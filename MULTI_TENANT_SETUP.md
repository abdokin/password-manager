# Multi-Tenant SaaS Setup Guide

## Architecture Overview

This password manager is now a **multi-tenant SaaS application** with the following architecture:

### Database Structure

1. **Main Database** (`sqlite.db`)
   - Shared across all tenants
   - Contains: Users, Organizations, Members, Invitations
   - Location: Root directory

2. **Tenant Databases** (`data/tenants/tenant-{orgId}.db`)
   - One database per organization
   - Contains: Passwords, Categories, Password History
   - Location: `data/tenants/` directory
   - Created automatically when organization is created

### Key Features

- **Complete Data Isolation**: Each organization's data is in a separate database
- **Team Management**: Invite members, assign roles, manage permissions
- **Organization Switching**: Users can belong to multiple organizations
- **Subscription Plans**: Free, Pro, Enterprise tiers with usage limits
- **Role-Based Access**: Owner, Admin, Member, Viewer roles

## Setup Instructions

### 1. Initialize Main Database

```bash
# Generate and apply migrations for main database
pnpm drizzle-kit generate:sqlite --config=drizzle.config.main.ts
pnpm drizzle-kit push:sqlite --config=drizzle.config.main.ts
```

### 2. Tenant Databases

Tenant databases are **automatically created** when:

- A user creates a new organization
- The `createOrganization` function is called

Manual initialization (if needed):

```bash
pnpm tsx scripts/init-tenant-db.ts <organizationId>
```

### 3. Running the Application

```bash
# Start Next.js server and worker
pnpm dev:all

# Or separately:
pnpm dev      # Next.js server
pnpm worker   # Background job worker
```

## Usage Flow

1. **User Registration**
   - User signs up with email
   - Receives magic link via email
   - Clicks link to authenticate

2. **Organization Creation**
   - User creates first organization
   - Tenant database is automatically created
   - User becomes organization owner

3. **Team Management**
   - Owner/Admin invites team members
   - Invitations sent via email
   - Members can accept and join

4. **Password Management**
   - All passwords stored in organization's tenant database
   - Encrypted with AES-256-GCM
   - Access controlled by organization membership

## API Structure

### Organization Actions (`lib/organization.ts`)

- `createOrganization()` - Create new organization
- `getUserOrganizations()` - Get user's organizations
- `getOrganization()` - Get organization details
- `getOrganizationMembers()` - Get team members
- `inviteToOrganization()` - Invite member
- `removeMember()` - Remove member
- `updateMemberRole()` - Change member role

### Tenant-Aware Actions

All password operations are automatically scoped to current organization:

- `lib/tenant-actions.ts` - Password CRUD operations
- `lib/tenant-categories.ts` - Category management
- `lib/tenant-import-export.ts` - Import/export
- `lib/tenant-password-history.ts` - Password history

### Context Management

- `lib/tenant-context.ts` - Current organization context
- `lib/get-session.ts` - User session management

## Subscription Plans

Plans are defined in `lib/billing.ts`:

- **Free**: 5 members, 100 passwords
- **Pro**: 25 members, 1,000 passwords ($9.99/month)
- **Enterprise**: Unlimited ($29.99/month)

To integrate with payment providers (Stripe, etc.):

1. Update `updateSubscription()` in `lib/billing.ts`
2. Add webhook handlers for subscription events
3. Update organization limits based on subscription

## Security Considerations

1. **Tenant Isolation**
   - Organization ID validated on every request
   - Queries automatically scoped to current organization
   - No cross-tenant data access possible

2. **Role-Based Access**
   - Permissions checked before sensitive operations
   - Owner: Full control
   - Admin: Manage members and passwords
   - Member: Create/edit passwords
   - Viewer: Read-only

3. **Database Security**
   - Each tenant database is separate file
   - File system permissions should restrict access
   - Regular backups of all databases recommended

## Migration Path

If you have existing data in the old single-tenant structure:

1. Export all passwords from old database
2. Create organizations for each user/group
3. Import passwords into appropriate tenant databases
4. Update user-organization relationships

## Production Deployment

1. **Database Backups**
   - Backup main database regularly
   - Backup all tenant databases
   - Implement automated backup strategy

2. **Scaling Considerations**
   - Monitor tenant database sizes
   - Implement database cleanup policies
   - Consider connection pooling for high traffic

3. **Monitoring**
   - Track organization creation rate
   - Monitor tenant database sizes
   - Alert on database errors

4. **Redis for Production**
   - Use Redis for job queue (not in-memory)
   - Configure Redis persistence
   - Set up Redis monitoring

## File Structure

```
data/
├── tenants/                    # Tenant databases (gitignored)
│   ├── tenant-1.db
│   ├── tenant-2.db
│   └── ...
└── schema.ts                   # Main DB schema

drizzle/
├── main/                       # Main DB migrations
└── tenant/                     # Tenant DB migrations (template)
```

## Troubleshooting

### Tenant database not created

- Check `data/tenants/` directory exists and is writable
- Verify organization was created successfully
- Check application logs for errors

### Cannot access organization data

- Verify user is a member of the organization
- Check current organization ID in cookie
- Ensure tenant database exists

### Migration issues

- Run migrations for main database first
- Tenant databases use template migrations
- Check drizzle config files are correct
