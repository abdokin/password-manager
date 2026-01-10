# Password Manager

A password manager application built with Rails 8 API backend and React frontend.

## Project Structure

```
password-manager/
├── backend/          # Rails 8 API
│   └── app/
│       ├── models/
│       ├── services/
│       └── jobs/
└── frontend/         # React + Vite
    └── src/
```

## Setup

### Backend (Rails API)

```bash
cd backend
bundle install
rails db:create db:migrate
rails server
# Runs on http://localhost:3000
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## Development

1. Start the Rails API server:
   ```bash
   cd backend && rails server
   ```

2. Start the React frontend:
   ```bash
   cd frontend && npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Tech Stack

- **Backend**: Rails 8 (API mode)
- **Frontend**: React 18 + Vite + TypeScript
- **Database**: SQLite3 (default)
