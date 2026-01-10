# Password Manager SaaS

A full-featured password manager and secrets management platform built with Rails 8 API backend and React frontend with Tailwind CSS v4 and shadcn/ui.

## Features

### Core Features
- 🔐 Secure password storage with encryption
- 👥 Multi-user and organization support
- 🏷️ Categories and tags for organization
- ⭐ Favorites and quick access
- 🔍 Advanced search and filtering
- 📊 Security audit dashboard
- 📈 Password strength analysis
- ⚠️ Breach detection
- 🔄 Duplicate detection
- 📤 Import/Export (JSON & CSV)
- 🔗 Password sharing between users
- 📦 Bulk operations
- ⚙️ User settings and preferences

### Environment Management (NEW!)
- 🌍 Multi-environment support (dev, staging, production, test)
- 🔐 Encrypted environment variables
- 👥 Team access control with roles (viewer, editor, admin)
- 🔒 Secure variable storage
- 📝 Variable versioning and history

### Payment System (NEW!)
- 💳 Pluggable payment provider architecture
- 🔌 Multiple provider support (Stripe, PayPal, Mock)
- 📋 Subscription management
- 💰 Flexible pricing plans
- 🔄 Easy provider switching

### Security Features
- 🔑 JWT-based authentication
- 🛡️ Rate limiting
- 📝 Activity logging
- 🔒 Password encryption
- 🚨 Security alerts

### SaaS Features
- 💳 Subscription management with pluggable providers
- 👨‍💼 Organization management
- 📊 Analytics dashboard
- 🔔 Activity logs
- 📧 Email notifications (ready)

## Tech Stack

### Backend
- **Rails 8** (API mode)
- **PostgreSQL** (production) / **SQLite** (development)
- **RSpec** for testing
- **JWT** for authentication
- **Rack::Attack** for rate limiting
- **PaperTrail** for versioning
- **Sidekiq** for background jobs

### Frontend
- **React 18** with TypeScript
- **TanStack Query** for data fetching
- **TanStack React Form** with Zod validation
- **Axios** for HTTP requests
- **Tailwind CSS v4** for styling
- **shadcn/ui** for components
- **Vite** for building

## Payment Providers

The payment system is designed to be pluggable and provider-agnostic. Currently supported:

1. **Mock Provider** (default) - For development and testing
2. **Stripe** - Full Stripe integration
3. **PayPal** - PayPal payment processing

### Adding a New Payment Provider

1. Create a new provider class in `backend/app/services/payment_providers/`
2. Inherit from `PaymentProviders::BaseProvider`
3. Implement all required methods
4. Register in `PaymentProviders::Factory`

Example:
```ruby
class PaymentProviders::YourProvider < PaymentProviders::BaseProvider
  def create_customer(email, name)
    # Your implementation
  end
  
  # Implement other required methods...
end
```

## Setup

### Prerequisites
- Ruby 3.3.6
- Node.js 20+
- PostgreSQL (for production)
- Docker (for deployment)

### Backend Setup

```bash
cd backend
bundle install
rails db:create db:migrate
rails server
```

The API will run on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### Environment Variables

See `.env.example` files in `backend/` and `frontend/` directories for required environment variables.

### Running Tests

```bash
# Backend tests
cd backend
bundle exec rspec

# Frontend tests (when added)
cd frontend
npm test
```

## Deployment

### Using Kamal

1. Configure your deployment settings in `config/deploy.yml`
2. Set up secrets in `.kamal/secrets`
3. Deploy:

```bash
kamal setup
kamal deploy
```

### Environment Variables

- `RAILS_MASTER_KEY` - Rails master key for credentials
- `POSTGRES_PASSWORD` - Database password
- `KAMAL_REGISTRY_PASSWORD` - Container registry password
- `DEFAULT_PAYMENT_PROVIDER` - Payment provider (stripe, paypal, mock)
- `STRIPE_SECRET_KEY` - Stripe secret key (if using Stripe)
- `PAYPAL_CLIENT_ID` - PayPal client ID (if using PayPal)

## CI/CD

GitHub Actions workflow is configured in `.github/workflows/ci.yml`:
- Runs tests on push/PR
- Builds frontend
- Deploys to production on main branch

## API Documentation

### Authentication
- `POST /api/v1/auth/magic_link` - Request magic link
- `POST /api/v1/auth/verify` - Verify magic link token
- `POST /api/v1/auth/login` - Login with email
- `GET /api/v1/auth/me` - Get current user

### Payments
- `GET /api/v1/organizations/:id/payments/plans` - Get available plans
- `POST /api/v1/organizations/:id/payments/checkout` - Create checkout session
- `GET /api/v1/organizations/:id/payments/subscription` - Get subscription
- `POST /api/v1/organizations/:id/payments/cancel` - Cancel subscription
- `POST /api/v1/organizations/:id/payments/webhook` - Payment webhook

### Environments
- `GET /api/v1/organizations/:id/environments` - List environments
- `POST /api/v1/organizations/:id/environments` - Create environment
- `GET /api/v1/organizations/:id/environments/:env_id/variables` - List variables
- `POST /api/v1/organizations/:id/environments/:env_id/variables` - Add variable
- `GET /api/v1/organizations/:id/environments/:env_id/variables/:key` - Get variable value
- `POST /api/v1/organizations/:id/environments/:env_id/accesses` - Grant access

## License

MIT
