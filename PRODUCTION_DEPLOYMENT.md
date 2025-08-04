# Production Deployment Guide

## Prerequisites

1. **Server Requirements:**
   - Ubuntu 20.04+ หรือ Debian 11+
   - Docker และ Docker Compose ติดตั้งแล้ว
   - Domain name (thaihand.shop) ชี้มาที่ server
   - SSL certificate (Let's Encrypt)

2. **Environment Variables:**
   สร้างไฟล์ `.env` ใน root directory ด้วยค่าต่อไปนี้:

```env
# Database Configuration
DATABASE_URL=postgresql://thaihand_user:thaihand_password@postgres:5432/thaihand_db

# Security
SECRET_KEY=d0ba4166ca78d7298df508443de6b6b42e240ae56da8de00722b04a60aff3ff4
NEXTAUTH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=False

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://thaihand.shop,https://www.thaihand.shop

# Frontend Configuration
NEXT_PUBLIC_API_URL=https://thaihand.shop/api
NEXTAUTH_URL=https://thaihand.shop

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abhprxkswysntmerxklb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaHByeGtzd3lzbnRtZXJ4a2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTc2ODAsImV4cCI6MjA2NzAzMzY4MH0.MLRoT_AH5V9XrSFo7eDbqS8K76LTU69nxYUQqn9tIhk

# OAuth Configuration
GOOGLE_CLIENT_ID=570780773041-6h7v60llj41ml3pfvssjs45cadaa403t.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
LINE_CLIENT_ID=2007700233
LINE_CLIENT_SECRET=b49b03b3902d44cf84d91b32aca5574e

NEXT_PUBLIC_BACKEND_URL=https://thaihand.shop
```

## Deployment Steps

### 1. Setup SSL Certificate

```bash
# ติดตั้ง Certbot
sudo apt update
sudo apt install certbot

# ขอ SSL certificate
sudo certbot certonly --standalone -d thaihand.shop -d www.thaihand.shop
```

### 2. Deploy Application

```bash
# ให้สิทธิ์ execute กับ deploy script
chmod +x deploy.sh

# รัน deployment
./deploy.sh
```

### 3. Verify Deployment

ตรวจสอบว่า services ทั้งหมดทำงานปกติ:

```bash
# ตรวจสอบ container status
docker-compose ps

# ตรวจสอบ logs
docker-compose logs -f

# ตรวจสอบ health endpoints
curl https://thaihand.shop/api/health
curl https://thaihand.shop/health
```

## Monitoring

### View Logs
```bash
# ทั้งหมด
docker-compose logs -f

# เฉพาะ service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f nginx
```

### Restart Services
```bash
# Restart ทั้งหมด
docker-compose restart

# Restart เฉพาะ service
docker-compose restart frontend
docker-compose restart backend
```

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild และ restart
docker-compose up -d --build
```

## Troubleshooting

### Common Issues

1. **SSL Certificate Issues:**
   ```bash
   # ตรวจสอบ certificate
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew
   ```

2. **Database Connection Issues:**
   ```bash
   # ตรวจสอบ database
   docker-compose exec postgres psql -U thaihand_user -d thaihand_db
   ```

3. **API Connection Issues:**
   ```bash
   # ตรวจสอบ backend logs
   docker-compose logs backend
   
   # ตรวจสอบ nginx logs
   docker-compose logs nginx
   ```

### Performance Optimization

1. **Enable Gzip Compression** (already configured in nginx)
2. **Database Indexing** (use Alembic migrations)
3. **CDN for Static Assets** (configure in next.config.mjs)

## Security Checklist

- [ ] SSL certificate installed and valid
- [ ] Environment variables secured
- [ ] Database password strong
- [ ] OAuth secrets secure
- [ ] CSP headers configured
- [ ] Rate limiting enabled
- [ ] Regular backups configured

## Backup Strategy

```bash
# Database backup
docker-compose exec postgres pg_dump -U thaihand_user thaihand_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U thaihand_user thaihand_db < backup.sql
```

## Maintenance

### Weekly Tasks
- [ ] Check SSL certificate expiration
- [ ] Review application logs
- [ ] Monitor disk space
- [ ] Update dependencies

### Monthly Tasks
- [ ] Security updates
- [ ] Performance review
- [ ] Backup verification
- [ ] SSL certificate renewal 