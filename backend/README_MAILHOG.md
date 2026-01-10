# MailHog Setup for Email Testing

MailHog is configured for development email testing. All emails sent in development will be captured by MailHog instead of being sent to real email addresses.

## Installation

### Using Docker (Recommended)
```bash
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

### Using Homebrew (macOS)
```bash
brew install mailhog
mailhog
```

### Manual Installation
Download from: https://github.com/mailhog/MailHog/releases

## Usage

1. Start MailHog before running the Rails server
2. All emails sent in development will be captured
3. View emails at: http://localhost:8025

## Testing Magic Links

1. Request a magic link via the API:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/magic_link \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

2. Check MailHog at http://localhost:8025 to see the email
3. Copy the verification token from the email
4. Use it to verify:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/verify \
     -H "Content-Type: application/json" \
     -d '{"token":"YOUR_TOKEN_HERE"}'
   ```

## Configuration

MailHog is configured in `config/environments/development.rb`:
- SMTP server: localhost:1025
- Web UI: http://localhost:8025
