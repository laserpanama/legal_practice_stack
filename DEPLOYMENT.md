# Deployment Guide - Legal Practice Stack

This guide provides detailed instructions for deploying the Legal Practice Stack to production environments.

## Table of Contents

1. [Manus Platform Deployment](#manus-platform-deployment)
2. [Manual Server Deployment](#manual-server-deployment)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Security Checklist](#security-checklist)
6. [Monitoring & Maintenance](#monitoring--maintenance)

## Manus Platform Deployment

The Legal Practice Stack is optimized for deployment on the Manus platform, which provides:

- Automatic scaling and load balancing
- Built-in SSL/TLS encryption
- Custom domain support
- Managed database hosting
- Environment variable management
- Automatic backups
- CDN integration

### Steps to Deploy on Manus

1. **Connect Your Repository**
   - Link your GitHub repository to Manus
   - Authorize Manus to access your repository

2. **Configure Environment Variables**
   - Navigate to Settings → Secrets in the Manus dashboard
   - Add the following required variables:
     - `DATABASE_URL`: Your database connection string
     - `JWT_SECRET`: Session signing secret
     - `VITE_APP_ID`: OAuth application ID
     - `OAUTH_SERVER_URL`: OAuth server URL
     - `VITE_OAUTH_PORTAL_URL`: OAuth portal URL

3. **Deploy**
   - Click the "Publish" button in the Manus dashboard
   - Select the branch to deploy (typically `main`)
   - Manus will automatically build and deploy your application

4. **Custom Domain**
   - In Settings → Domains, configure your custom domain
   - Update DNS records as instructed
   - Enable HTTPS (automatic with Manus)

## Manual Server Deployment

For self-hosted deployments on your own infrastructure:

### Prerequisites

- Node.js 22.13.0 or higher
- pnpm 10.4.1 or higher
- MySQL 8.0+ or TiDB
- Nginx or Apache (reverse proxy)
- SSL certificate (Let's Encrypt recommended)

### Step 1: Prepare Your Server

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Create application directory
sudo mkdir -p /var/www/legal-practice-stack
cd /var/www/legal-practice-stack
```

### Step 2: Clone and Setup Application

```bash
# Clone the repository
git clone https://github.com/laserpanama/legal_practice_stack.git .

# Install dependencies
pnpm install

# Create .env file with production configuration
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=mysql://user:password@localhost:3306/legal_practice
JWT_SECRET=your-secret-key-here
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_OPEN_ID=your-owner-id
OWNER_NAME="Your Name"
VITE_APP_TITLE="Legal Practice Stack"
EOF

# Build the application
pnpm build
```

### Step 3: Setup Database

```bash
# Create database
mysql -u root -p << 'EOF'
CREATE DATABASE legal_practice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'legal_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON legal_practice.* TO 'legal_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Run migrations
pnpm db:push
```

### Step 4: Configure Reverse Proxy (Nginx)

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/legal-practice-stack > /dev/null << 'EOF'
upstream legal_practice {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy configuration
    location / {
        proxy_pass http://legal_practice;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/legal-practice-stack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Setup SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Step 6: Setup Process Manager (PM2)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'legal-practice-stack',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Create logs directory
mkdir -p logs
```

### Step 7: Setup Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Setup log rotation
sudo tee /etc/logrotate.d/legal-practice-stack > /dev/null << 'EOF'
/var/www/legal-practice-stack/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reload legal-practice-stack > /dev/null 2>&1 || true
    endscript
}
EOF
```

## Database Setup

### MySQL Configuration

```bash
# Create database with proper character set
CREATE DATABASE legal_practice 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

# Create dedicated user
CREATE USER 'legal_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON legal_practice.* TO 'legal_user'@'localhost';

# For remote access (if needed)
CREATE USER 'legal_user'@'%' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON legal_practice.* TO 'legal_user'@'%';

FLUSH PRIVILEGES;
```

### Database Backup Strategy

```bash
# Create backup script
cat > /usr/local/bin/backup-legal-practice.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/legal-practice"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="legal_practice"
DB_USER="legal_user"

mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/legal_practice_$DATE.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/legal_practice_$DATE.sql.gz s3://your-bucket/backups/
EOF

chmod +x /usr/local/bin/backup-legal-practice.sh

# Schedule daily backups
echo "0 2 * * * /usr/local/bin/backup-legal-practice.sh" | sudo crontab -
```

## Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `DATABASE_URL` | Database connection string | `mysql://user:pass@localhost:3306/db` |
| `JWT_SECRET` | Session signing secret | Generate with `openssl rand -base64 32` |
| `VITE_APP_ID` | OAuth application ID | From Manus dashboard |
| `OAUTH_SERVER_URL` | OAuth server URL | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | OAuth portal URL | `https://oauth.manus.im` |
| `OWNER_OPEN_ID` | Owner's OAuth ID | From Manus |
| `OWNER_NAME` | Owner's name | Your name |
| `VITE_APP_TITLE` | Application title | `Legal Practice Stack` |

### Optional Environment Variables

```bash
# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Performance
MAX_CONNECTIONS=100
CONNECTION_TIMEOUT=30000

# Security
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100

# Features
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
```

## Security Checklist

Before deploying to production, ensure:

- [ ] All environment variables are set securely
- [ ] Database password is strong (minimum 16 characters)
- [ ] SSL/TLS certificate is valid and not self-signed
- [ ] Firewall rules are configured (only allow necessary ports)
- [ ] Database backups are automated and tested
- [ ] Monitoring and alerting are configured
- [ ] Log aggregation is setup
- [ ] Regular security updates are scheduled
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] SQL injection prevention is in place (Drizzle ORM handles this)
- [ ] XSS protection headers are set
- [ ] CSRF protection is enabled
- [ ] Sensitive data is encrypted
- [ ] Access logs are being recorded

### Security Headers Configuration

```bash
# Add to Nginx configuration
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

## Monitoring & Maintenance

### Application Monitoring

```bash
# Check application status
pm2 status

# View logs
pm2 logs legal-practice-stack

# Monitor in real-time
pm2 monit

# Check resource usage
top -p $(pgrep -f "node.*dist/index.js" | head -1)
```

### Database Monitoring

```bash
# Check database size
mysql -u legal_user -p legal_practice -e "
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES
WHERE table_schema = 'legal_practice'
ORDER BY (data_length + index_length) DESC;"

# Check for slow queries
mysql -u legal_user -p legal_practice -e "
SELECT * FROM mysql.slow_log LIMIT 10;"
```

### Regular Maintenance Tasks

**Daily:**
- Monitor application logs for errors
- Check disk space
- Verify database backups completed

**Weekly:**
- Review security logs
- Check for available updates
- Test backup restoration

**Monthly:**
- Update system packages
- Review performance metrics
- Audit user access logs
- Test disaster recovery procedures

**Quarterly:**
- Security audit
- Performance optimization review
- Capacity planning

### Updating the Application

```bash
# Stop the application
pm2 stop legal-practice-stack

# Pull latest code
cd /var/www/legal-practice-stack
git pull origin main

# Install dependencies
pnpm install

# Run migrations if needed
pnpm db:push

# Build
pnpm build

# Start application
pm2 start ecosystem.config.js

# Verify
pm2 logs legal-practice-stack
```

## Troubleshooting

### Application won't start

```bash
# Check logs
pm2 logs legal-practice-stack

# Verify environment variables
env | grep -E "DATABASE_URL|JWT_SECRET"

# Check database connection
mysql -u legal_user -p -h localhost legal_practice -e "SELECT 1;"
```

### Database connection errors

```bash
# Test connection
mysql -u legal_user -p -h localhost legal_practice -e "SELECT 1;"

# Check MySQL is running
sudo systemctl status mysql

# Check firewall
sudo ufw status
```

### High memory usage

```bash
# Increase max_memory_restart in ecosystem.config.js
# Restart application
pm2 restart legal-practice-stack

# Check for memory leaks
pm2 logs legal-practice-stack | grep -i "memory"
```

## Support

For deployment issues or questions, please:
1. Check the logs: `pm2 logs legal-practice-stack`
2. Review this guide's troubleshooting section
3. Open an issue on GitHub
4. Contact support@legalpracticestack.com

---

**Last Updated:** December 2025
