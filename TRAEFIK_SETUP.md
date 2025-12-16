# Traefik Setup Guide

This guide explains how Traefik is configured for the password manager application.

## Overview

Traefik is a modern reverse proxy and load balancer that automatically discovers services via Docker labels. It handles:

- SSL/TLS certificates (Let's Encrypt)
- Load balancing
- Security headers
- Rate limiting
- Request routing

## Architecture

```
Internet → Traefik (Port 80/443) → App (Port 3000)
                              → Redis (Internal)
                              → Worker (Internal)
```

## Configuration Files

### `traefik.yml`

Main Traefik configuration:

- Entry points (HTTP/HTTPS)
- Let's Encrypt ACME configuration
- Docker provider settings
- Logging configuration

### `traefik-dynamic.yml`

Dynamic configuration for:

- Middlewares (security headers, rate limiting, compression)
- Routers (optional dashboard router)
- TLS settings

### Docker Compose Labels

Services are configured via Docker labels in `docker-compose.prod.yml`:

- `traefik.enable=true` - Enable Traefik for this service
- `traefik.http.routers.*.rule` - Routing rules (Host, Path, etc.)
- `traefik.http.routers.*.entrypoints` - Which entry point to use
- `traefik.http.routers.*.tls.certresolver` - SSL certificate resolver
- `traefik.http.routers.*.middlewares` - Middlewares to apply
- `traefik.http.services.*.loadbalancer.server.port` - Backend port

## Setup Steps

### 1. Configure Environment Variables

Edit `.env` file:

```bash
# Required
DOMAIN=your-domain.com
ACME_EMAIL=your-email@example.com

# Optional - Dashboard authentication
TRAEFIK_DASHBOARD_USER=admin
TRAEFIK_DASHBOARD_PASSWORD_HASH=$(htpasswd -nb admin your-password | sed -e s/\\$/\\$\\$/g)
```

### 2. Generate Dashboard Password Hash

```bash
# Install htpasswd if needed
# Ubuntu/Debian: sudo apt-get install apache2-utils
# macOS: brew install httpd

# Generate hash
htpasswd -nb admin your-password

# Copy the output to TRAEFIK_DASHBOARD_PASSWORD_HASH in .env
# Example: admin:$2y$10$...
```

### 3. Configure DNS

Point your domain to your server:

```
A Record: your-domain.com → YOUR_SERVER_IP
A Record: traefik.your-domain.com → YOUR_SERVER_IP (optional, for dashboard)
```

### 4. Start Services

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 5. Verify

- Application: `https://your-domain.com`
- Dashboard: `https://traefik.your-domain.com` (if configured)
- Health: `https://your-domain.com/api/health`

## Features

### Automatic SSL/TLS

Traefik automatically:

- Requests SSL certificates from Let's Encrypt
- Renews certificates before expiration
- Stores certificates in Docker volume `traefik-letsencrypt`

### Security Headers

Pre-configured security headers middleware includes:

- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict Transport Security (HSTS)
- X-XSS-Protection
- Referrer Policy

### Rate Limiting

Configured rate limiting:

- Average: 100 requests per minute
- Burst: 50 requests
- Applied to all routes

### Compression

Automatic response compression for:

- text/html
- text/css
- text/javascript
- application/json
- And more

## Troubleshooting

### SSL Certificate Not Issued

1. Check DNS is pointing correctly:

   ```bash
   dig your-domain.com
   ```

2. Check Traefik logs:

   ```bash
   docker-compose -f docker-compose.prod.yml logs traefik
   ```

3. Verify ports 80 and 443 are open:

   ```bash
   sudo ufw status
   ```

4. Check ACME email is set correctly in `.env`

### Dashboard Not Accessible

1. Verify dashboard labels in `docker-compose.prod.yml`
2. Check password hash is correctly formatted
3. Ensure port 8080 is exposed (or remove if not needed)
4. Check Traefik logs for errors

### Service Not Discovered

1. Verify `traefik.enable=true` label is present
2. Check service is on same Docker network
3. Verify Traefik can access Docker socket
4. Check Traefik logs for discovery errors

### Rate Limiting Too Strict

Adjust in `traefik-dynamic.yml`:

```yaml
rate-limit:
  rateLimit:
    average: 200 # Increase as needed
    period: 1m
    burst: 100 # Increase as needed
```

## Advanced Configuration

### Multiple Domains

Add multiple router rules:

```yaml
labels:
  - "traefik.http.routers.app.rule=Host(`domain1.com`) || Host(`domain2.com`)"
```

### Custom Middleware

Add to `traefik-dynamic.yml`:

```yaml
http:
  middlewares:
    custom-auth:
      basicAuth:
        users:
          - "user1:password1"
          - "user2:password2"
```

Then reference in service labels:

```yaml
- "traefik.http.routers.app.middlewares=custom-auth@file"
```

### Load Balancing Multiple Instances

Traefik automatically load balances if you scale the app:

```bash
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

### Custom SSL Certificates

1. Place certificates in `./certs/`:
   - `cert.pem`
   - `key.pem`

2. Update `traefik.yml`:

```yaml
entryPoints:
  websecure:
    address: ":443"
    tls:
      certificates:
        - certFile: /certs/cert.pem
          keyFile: /certs/key.pem
```

3. Add volume to docker-compose:

```yaml
volumes:
  - ./certs:/certs:ro
```

## Monitoring

### Traefik Dashboard

Access at `https://traefik.your-domain.com` to see:

- Active routers
- Services
- Middlewares
- Entry points
- SSL certificates

### Metrics (Optional)

Enable Prometheus metrics in `traefik.yml`:

```yaml
metrics:
  prometheus:
    addEntryPointsLabels: true
    addServicesLabels: true
```

## Security Best Practices

1. **Restrict Dashboard Access**: Use firewall rules or remove port 8080 exposure
2. **Strong Dashboard Password**: Use a strong password for dashboard auth
3. **Regular Updates**: Keep Traefik image updated
4. **Network Isolation**: Use Docker networks to isolate services
5. **Monitor Logs**: Regularly check Traefik logs for suspicious activity

## Resources

- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Traefik Docker Provider](https://doc.traefik.io/traefik/providers/docker/)
- [Let's Encrypt with Traefik](https://doc.traefik.io/traefik/https/acme/)
