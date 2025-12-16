# Production Deployment Guide

## Pre-Deployment Checklist

- [ ] Environment variables configured in `.env`
- [ ] Strong secrets generated (NEXTAUTH_SECRET, MASTER_ENCRYPTION_KEY)
- [ ] SMTP server configured and tested
- [ ] Redis configured (recommended for production)
- [ ] Database backups configured
- [ ] SSL/TLS certificates ready
- [ ] Domain name configured
- [ ] Monitoring and logging setup

## Docker Production Deployment

### 1. Prepare Environment

```bash
# Copy example environment file
cp .env.example .env

# Generate secure secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -base64 32  # For MASTER_ENCRYPTION_KEY

# Edit .env with production values
nano .env
```

### 2. Build and Start Services

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. Verify Deployment

```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "...",
#   "checks": { ... }
# }
```

## Manual Production Deployment

### 1. Install Dependencies

```bash
pnpm install --production=false
pnpm build
```

### 2. Run Migrations

```bash
pnpm migrate
```

### 3. Start Services

```bash
# Start Next.js server
pnpm start

# Start worker (in separate terminal/process manager)
pnpm worker
```

### 4. Use Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start pnpm --name "password-manager" -- start
pm2 start pnpm --name "password-manager-worker" -- worker

# Save PM2 configuration
pm2 save
pm2 startup
```

## Reverse Proxy (Traefik)

Traefik is configured automatically via Docker labels. It provides:

- Automatic SSL/TLS with Let's Encrypt
- Service discovery via Docker labels
- Load balancing
- Security headers
- Rate limiting
- Dashboard for monitoring

### Configuration

1. **Set Environment Variables** in `.env`:

```bash
DOMAIN=your-domain.com
ACME_EMAIL=your-email@example.com
TRAEFIK_DASHBOARD_USER=admin
TRAEFIK_DASHBOARD_PASSWORD_HASH=$(echo $(htpasswd -nb admin your-password) | sed -e s/\\$/\\$\\$/g)
```

2. **Generate Dashboard Password Hash**:

```bash
# Install htpasswd (if not available)
# Ubuntu/Debian: apt-get install apache2-utils
# macOS: brew install httpd
# Or use online tool: https://hostingcanada.org/htpasswd-generator/

htpasswd -nb admin your-password
# Copy the output to TRAEFIK_DASHBOARD_PASSWORD_HASH
```

3. **Traefik Features**:
   - **Automatic HTTPS**: SSL certificates are automatically obtained and renewed via Let's Encrypt
   - **Service Discovery**: Services are automatically discovered via Docker labels
   - **Security Headers**: Pre-configured security headers middleware
   - **Rate Limiting**: 100 requests/minute with burst of 50
   - **Compression**: Automatic response compression
   - **Dashboard**: Access at `https://traefik.your-domain.com` (protected with basic auth)

### Access Points

- **Application**: `https://your-domain.com`
- **Traefik Dashboard**: `https://traefik.your-domain.com` (requires auth)
- **Health Check**: `https://your-domain.com/api/health`

### Custom Domain Configuration

To use a custom domain, update the `DOMAIN` environment variable and ensure:

1. DNS A record points to your server IP
2. Ports 80 and 443 are open in firewall
3. `.env` file has correct `DOMAIN` and `ACME_EMAIL` values

### Manual SSL Certificate (Optional)

If you prefer to use your own SSL certificates instead of Let's Encrypt:

1. Place certificates in `./certs/` directory:
   - `cert.pem` - Certificate file
   - `key.pem` - Private key file

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

3. Add volume to `docker-compose.prod.yml`:

```yaml
volumes:
  - ./certs:/certs:ro
```

## Database Backups

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/password-manager"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup main database
cp /app/sqlite.db "$BACKUP_DIR/main_$DATE.db"

# Backup all tenant databases
mkdir -p "$BACKUP_DIR/tenants_$DATE"
cp -r /app/data/tenants/* "$BACKUP_DIR/tenants_$DATE/"

# Keep only last 30 days
find "$BACKUP_DIR" -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Cron Job

```bash
# Add to crontab (crontab -e)
0 2 * * * /path/to/backup.sh
```

## Monitoring

### Health Checks

Set up monitoring to check `/api/health` endpoint:

- **Interval**: Every 30 seconds
- **Timeout**: 10 seconds
- **Alert**: If status != "healthy" for 2 consecutive checks

### Log Aggregation

Configure log aggregation for:

- Application logs
- Error logs
- Access logs
- Worker logs

Options:

- ELK Stack (Elasticsearch, Logstash, Kibana)
- Datadog
- CloudWatch
- Sentry

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Place multiple app instances behind a load balancer
2. **Session Storage**: Use Redis for session storage (if needed)
3. **File Storage**: Use shared storage for tenant databases (NFS, S3, etc.)
4. **Database**: Consider PostgreSQL for better multi-instance support

### Vertical Scaling

- Increase container resources (CPU, memory)
- Optimize database queries
- Add caching layer (Redis)

## Security Hardening

1. **Firewall**: Only expose necessary ports (80, 443, 8080 for dashboard - optional)
2. **Rate Limiting**: Configured in Traefik (100 req/min with burst of 50)
3. **DDoS Protection**: Use Cloudflare or similar service in front of Traefik
4. **Regular Updates**: Keep dependencies updated
5. **Security Headers**: Configured in Traefik middleware and `next.config.js`
6. **SSL/TLS**: Automatic via Let's Encrypt with Traefik
7. **Dashboard Protection**: Traefik dashboard protected with basic auth
8. **Database Encryption**: Consider encrypting database files at rest
9. **Backup Encryption**: Encrypt backups before storage
10. **Traefik Dashboard**: Restrict access to dashboard (consider removing port 8080 exposure in production)

## Troubleshooting

### Application Won't Start

1. Check environment variables
2. Check database permissions
3. Check Redis connection (if configured)
4. View logs: `docker-compose logs app`

### Worker Not Processing Jobs

1. Check Redis connection
2. Check worker logs: `docker-compose logs worker`
3. Verify worker is running: `docker-compose ps`

### Database Issues

1. Check database file permissions
2. Verify migrations ran: Check migration logs
3. Check disk space
4. Verify database integrity

### Performance Issues

1. Check resource usage: `docker stats`
2. Review slow queries
3. Check Redis performance
4. Monitor application logs for errors

## Rollback Procedure

```bash
# Stop current version
docker-compose -f docker-compose.prod.yml down

# Restore previous version
git checkout <previous-commit>
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Restore database (if needed)
cp /backups/main_YYYYMMDD_HHMMSS.db /app/sqlite.db
```

## Maintenance

### Regular Tasks

- **Daily**: Check health endpoint, review error logs
- **Weekly**: Review security logs, check disk space
- **Monthly**: Update dependencies, review performance metrics
- **Quarterly**: Security audit, backup restoration test

### Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations (if any)
docker-compose -f docker-compose.prod.yml run --rm db-migrate
```
