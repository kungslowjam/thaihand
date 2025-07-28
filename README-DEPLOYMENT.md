# 🚀 ThaiHand Deployment

## 📋 สิ่งที่จำเป็นสำหรับ Deploy

### ไฟล์หลัก
- `docker-compose.yml` - Container orchestration
- `backend/Dockerfile` - Backend container
- `frontend/Dockerfile` - Frontend container
- `nginx/nginx.conf` - Reverse proxy
- `deploy-simple.sh` - Deployment script
- `backup.sh` - Backup script

### Environment
- `env.production.template` - Production environment template
- `.env` - Production environment (สร้างเอง, ถูก ignore)
- `backend/env.example` - Development environment template

## 🔧 ขั้นตอนการ Deploy

### 1. เตรียม VPS
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. Clone และ Setup
```bash
git clone <repository>
cd thaihand
cp backend/env.example .env
# แก้ไข .env ด้วยข้อมูลจริง
```

### 3. Deploy
```bash
chmod +x deploy-simple.sh backup.sh
./deploy-simple.sh
```

### 4. Firewall
```bash
sudo ufw allow ssh,80,443
sudo ufw enable
```

## 📊 การดูแลระบบ

### ตรวจสอบสถานะ
```bash
docker-compose ps
docker-compose logs -f
curl http://localhost:8000/health
```

### Backup
```bash
./backup.sh
```

### อัปเดต
```bash
./backup.sh
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
docker-compose exec backend alembic upgrade head
```

## 🎯 สรุป

**ใช้แค่:**
- ✅ Docker + Docker Compose
- ✅ Nginx (reverse proxy)
- ✅ SSL certificate
- ✅ Basic firewall
- ✅ Simple backup

**ไม่จำเป็น:**
- ❌ Complex monitoring
- ❌ Advanced security
- ❌ Systemd services
- ❌ Log rotation

**เมื่อโตขึ้นค่อยเพิ่ม!** 🚀 