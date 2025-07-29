# ThaiHand Deployment Guide

## 🌐 Domain Configuration
- **Domain**: thaihand.shop
- **SSL**: Required (HTTPS only)
- **Ports**: 80 (HTTP redirect), 443 (HTTPS)

## 📋 Prerequisites

### VPS Requirements
- Ubuntu 20.04+ หรือ CentOS 8+
- Docker และ Docker Compose
- 2GB RAM minimum
- 20GB storage

### Domain Setup
1. Point domain `thaihand.shop` และ `www.thaihand.shop` ไปยัง VPS IP
2. Wait for DNS propagation (อาจใช้เวลา 24-48 ชั่วโมง)

## 🚀 Quick Deployment

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd thaihand
```

### 2. Create Environment File
```bash
cp backend/env.example .env
```

### 3. Configure Environment Variables
แก้ไขไฟล์ `.env`:
```bash
# Security
SECRET_KEY=your-very-secure-secret-key-here
NEXTAUTH_SECRET=your-nextauth-secret

# Database
DATABASE_URL=postgresql://thaihand_user:thaihand_password@postgres:5432/thaihand_db

# OAuth (ถ้าใช้)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINE_CLIENT_ID=your-line-client-id
LINE_CLIENT_SECRET=your-line-client-secret

# Supabase (ถ้าใช้)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. SSL Certificate Setup

#### Option A: Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d thaihand.shop -d www.thaihand.shop

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Option B: Manual SSL Certificate
```bash
# Place your SSL files
mkdir -p nginx/ssl
cp your-certificate.crt nginx/ssl/thaihand.shop.crt
cp your-private-key.key nginx/ssl/thaihand.shop.key
```

### 5. Deploy Application
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔧 Configuration Files

### Nginx Configuration
- **File**: `nginx/nginx.conf`
- **Features**:
  - HTTP to HTTPS redirect
  - SSL/TLS configuration
  - Security headers
  - Rate limiting
  - Static file caching

### Docker Compose
- **File**: `docker-compose.yml`
- **Services**:
  - PostgreSQL Database
  - Backend API (FastAPI)
  - Frontend (Next.js)
  - Nginx Reverse Proxy

## 🔒 Security Setup

### Firewall Configuration
```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### SSL/TLS Security
- TLS 1.2 และ 1.3 only
- Strong cipher suites
- HSTS headers
- Security headers

## 📊 Monitoring

### Health Checks
- Backend: `https://thaihand.shop/health`
- Frontend: `https://thaihand.shop`

### Logs
```bash
# View logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

## 🔄 Maintenance

### Update Application
```bash
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
docker-compose exec backend alembic upgrade head
```

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U thaihand_user thaihand_db > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U thaihand_user thaihand_db < backup.sql
```

### SSL Certificate Renewal
```bash
# Let's Encrypt auto-renewal
sudo certbot renew

# Restart nginx
docker-compose restart nginx
```

## 🐛 Troubleshooting

### Common Issues

1. **SSL Certificate Error**
   ```bash
   # Check certificate
   openssl x509 -in nginx/ssl/thaihand.shop.crt -text -noout
   ```

2. **Database Connection Error**
   ```bash
   # Check database
   docker-compose exec postgres psql -U thaihand_user -d thaihand_db
   ```

3. **Nginx Configuration Error**
   ```bash
   # Test nginx config
   docker-compose exec nginx nginx -t
   ```

### Useful Commands
```bash
# Restart specific service
docker-compose restart backend

# View running containers
docker-compose ps

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh
```

## 📞 Support

หากมีปัญหาในการ deploy กรุณาติดต่อทีมพัฒนา หรือตรวจสอบ logs:
```bash
docker-compose logs -f
```

---

**Domain**: thaihand.shop  
**Last Updated**: $(date)  
**Version**: 1.0.0 