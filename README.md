# Password Manager SaaS

A full-featured password manager built with Rails 8 API backend and React frontend with Tailwind CSS v4 and shadcn/ui.

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

### Security Features
- 🔑 JWT-based authentication
- 🛡️ Rate limiting
- 📝 Activity logging
- 🔒 Password encryption
- 🚨 Security alerts

### SaaS Features
- 💳 Subscription management
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

### Passwords
- `GET /api/v1/passwords` - List passwords (with search/filter)
- `POST /api/v1/passwords` - Create password
- `GET /api/v1/passwords/:id` - Get password
- `PUT /api/v1/passwords/:id` - Update password
- `DELETE /api/v1/passwords/:id` - Delete password
- `POST /api/v1/passwords/:id/toggle_favorite` - Toggle favorite

### Bulk Operations
- `POST /api/v1/bulk/delete` - Delete multiple passwords
- `POST /api/v1/bulk/toggle_favorite` - Toggle favorite for multiple
- `POST /api/v1/bulk/move_to_category` - Move to category

### Password Sharing
- `GET /api/v1/password_shares` - List shared passwords
- `POST /api/v1/password_shares` - Share password
- `DELETE /api/v1/password_shares/:id` - Unshare password

### User Settings
- `GET /api/v1/user_settings` - Get all settings
- `POST /api/v1/user_settings` - Create setting
- `PUT /api/v1/user_settings/:key` - Update setting

## License

MIT
