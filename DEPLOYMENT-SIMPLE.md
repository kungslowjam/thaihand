# 🚀 ThaiHand Simple Deployment Guide

## 📋 สำหรับโปรเจคขนาดเล็ก (MVP)

### VPS Requirements
- **OS**: Ubuntu 20.04 LTS
- **RAM**: 2GB
- **Storage**: 20GB
- **CPU**: 1 vCPU

## 🔧 ขั้นตอนการ Deploy แบบง่าย

### 1. เตรียม VPS

```bash
# อัปเดตระบบ
sudo apt update && sudo apt upgrade -y

# ติดตั้ง Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# ติดตั้ง Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# ติดตั้ง Git
sudo apt install git -y
```

### 2. Clone Project

```bash
git clone <your-repository-url>
cd thaihand
```

### 3. ตั้งค่า Environment

```bash
# สร้างไฟล์ .env
cp env.production.template .env

# แก้ไข .env ด้วยข้อมูลจริง
nano .env
```

**Required Variables:**
```env
# Database
DATABASE_URL=postgresql://thaihand_user:thaihand_password@postgres:5432/thaihand_db

# Security
SECRET_KEY=your-secret-key-here
NEXTAUTH_SECRET=your-nextauth-secret

# Frontend
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINE_CLIENT_ID=your-line-client-id
LINE_CLIENT_SECRET=your-line-client-secret
```

### 4. Deploy

```bash
# ให้สิทธิ์ execute
chmod +x deploy-simple.sh backup.sh

# รัน deployment
./deploy-simple.sh
```

### 5. ตั้งค่า Firewall (พื้นฐาน)

```bash
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 6. ตั้งค่า Domain (ถ้ามี)

```bash
# แก้ไข nginx/nginx.conf
# เปลี่ยน yourdomain.com เป็น domain จริง

# สร้าง SSL certificate จริง (Let's Encrypt)
sudo apt install certbot -y
sudo certbot certonly --standalone -d yourdomain.com
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
```

## 📊 การดูแลระบบแบบง่าย

### ตรวจสอบสถานะ
```bash
# ดูสถานะ containers
docker-compose ps

# ดู logs
docker-compose logs -f

# ตรวจสอบ health
curl http://localhost:8000/health
```

### Backup ข้อมูล
```bash
# รัน backup
./backup.sh

# ตั้งค่า auto backup ทุกวัน
crontab -e
# เพิ่ม: 0 2 * * * /path/to/thaihand/backup.sh
```

### อัปเดต Application
```bash
# Backup ก่อน
./backup.sh

# Pull code ใหม่
git pull origin main

# Redeploy
docker-compose down
docker-compose build --no-cache
docker-compose up -d
docker-compose exec backend alembic upgrade head
```

## 🚨 การแก้ปัญหา

### ปัญหาที่พบบ่อย

1. **Port ถูกใช้งาน**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   ```

2. **Database ไม่เชื่อมต่อ**
   ```bash
   docker-compose logs postgres
   docker-compose exec postgres psql -U thaihand_user -d thaihand_db
   ```

3. **Memory ไม่พอ**
   ```bash
   # เพิ่ม swap
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

## 📝 สรุป

สำหรับโปรเจคขนาดเล็ก เราใช้แค่:
- ✅ Docker + Docker Compose
- ✅ Nginx (reverse proxy)
- ✅ SSL certificate (self-signed หรือ Let's Encrypt)
- ✅ Basic firewall
- ✅ Simple backup script
- ✅ Health check endpoint

**ไม่จำเป็น:**
- ❌ Complex monitoring
- ❌ Systemd services
- ❌ Advanced security hardening
- ❌ Log rotation
- ❌ Fail2ban

**เมื่อโปรเจคโตขึ้นค่อยเพิ่ม:**
- 🔄 Proper monitoring (Prometheus + Grafana)
- 🔄 Advanced security
- 🔄 Load balancing
- 🔄 CDN
- 🔄 Database clustering 