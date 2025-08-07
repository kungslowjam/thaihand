# GitLab CI/CD Setup สำหรับ ThaiHand

คู่มือการตั้งค่า Continuous Deployment (CD) ด้วย GitLab CI/CD เพื่อ deploy อัตโนมัติบน Digital Ocean droplets

## 📋 สิ่งที่ต้องเตรียม

### 1. Digital Ocean Droplet
- สร้าง Ubuntu 22.04 LTS droplet
- ขนาดขั้นต่ำ: 2GB RAM, 1 vCPU, 50GB SSD
- เปิด port 22 (SSH), 80 (HTTP), 443 (HTTPS)

### 2. Domain Name
- ตั้งค่า DNS ให้ชี้ไปที่ IP ของ droplet
- ตัวอย่าง: `thaihand.shop` → `YOUR_DROPLET_IP`

### 3. GitLab Repository
- โปรเจคต้องอยู่ใน GitLab repository
- ต้องมี branch `main` เป็น default branch

## 🚀 การตั้งค่า

### ขั้นตอนที่ 1: เตรียม Digital Ocean Droplet

1. **เชื่อมต่อ SSH ไปยัง droplet:**
```bash
ssh root@YOUR_DROPLET_IP
```

2. **รัน setup script:**
```bash
# Clone โปรเจค
git clone https://gitlab.com/YOUR_USERNAME/thaihand.git /opt/thaihand
cd /opt/thaihand

# รัน setup script
chmod +x scripts/setup-droplet.sh
./scripts/setup-droplet.sh
```

3. **ตั้งค่า SSL Certificate:**
```bash
# หลังจากที่ DNS ชี้มาที่ server แล้ว
certbot --nginx -d thaihand.shop -d www.thaihand.shop
```

4. **สร้าง SSH key สำหรับ GitLab CI/CD:**
```bash
# สร้าง SSH key
sudo -u thaihand ssh-keygen -t rsa -b 4096 -C "gitlab-ci@thaihand.shop"
sudo -u thaihand cat /home/thaihand/.ssh/id_rsa.pub >> /home/thaihand/.ssh/authorized_keys

# แสดง private key (จะใช้ใน GitLab)
sudo -u thaihand cat /home/thaihand/.ssh/id_rsa
```

### ขั้นตอนที่ 2: ตั้งค่า GitLab CI/CD Variables

ไปที่ GitLab repository → Settings → CI/CD → Variables

เพิ่ม variables ต่อไปนี้:

| Variable Name | Type | Value | Protected | Masked |
|---------------|------|-------|-----------|--------|
| `SSH_PRIVATE_KEY` | Variable | เนื้อหา private key จากขั้นตอนที่ 1 | ✅ | ✅ |
| `SSH_HOST` | Variable | IP address ของ droplet | ✅ | ❌ |
| `SSH_USER` | Variable | `thaihand` | ✅ | ❌ |
| `SSH_KNOWN_HOSTS` | Variable | Output จาก `ssh-keyscan YOUR_DROPLET_IP` | ✅ | ❌ |

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables

สร้างไฟล์ `.env` บน droplet:

```bash
sudo -u thaihand nano /opt/thaihand/.env
```

เพิ่ม environment variables ที่จำเป็น:

```env
# Database
DATABASE_URL=postgresql://thaihand_user:thaihand_password@postgres:5432/thaihand_db

# Backend
HOST=0.0.0.0
PORT=8000
DEBUG=False

# Frontend
NEXT_PUBLIC_API_URL=https://thaihand.shop/api
NEXT_PUBLIC_BACKEND_URL=https://thaihand.shop/api
NEXTAUTH_URL=https://thaihand.shop
NEXTAUTH_SECRET=your-secret-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abhprxkswysntmerxklb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINE_CLIENT_ID=your-line-client-id
LINE_CLIENT_SECRET=your-line-client-secret
```

### ขั้นตอนที่ 4: ทดสอบ Deployment

1. **Push code ไปยัง main branch:**
```bash
git add .
git commit -m "Initial deployment setup"
git push origin main
```

2. **ตรวจสอบ GitLab CI/CD pipeline:**
- ไปที่ GitLab repository → CI/CD → Pipelines
- ดูว่า pipeline ทำงานถูกต้องหรือไม่

3. **ตรวจสอบ deployment:**
```bash
# บน droplet
sudo -u thaihand /opt/thaihand/scripts/deploy.sh status
```

## 🔧 การจัดการ Deployment

### คำสั่งที่มีประโยชน์

```bash
# ตรวจสอบสถานะ
sudo -u thaihand /opt/thaihand/scripts/deploy.sh status

# Deploy ใหม่
sudo -u thaihand /opt/thaihand/scripts/deploy.sh deploy

# Rollback
sudo -u thaihand /opt/thaihand/scripts/deploy.sh rollback

# ดู backups
sudo -u thaihand /opt/thaihand/scripts/deploy.sh backups

# ดู logs
sudo -u thaihand docker-compose logs -f

# Restart services
sudo systemctl restart thaihand.service
```

### การ Monitor

```bash
# ดู system resources
htop

# ดู disk usage
df -h

# ดู memory usage
free -h

# ดู container status
sudo -u thaihand docker-compose ps

# ดู logs
tail -f /var/log/thaihand/deploy.log
tail -f /var/log/thaihand/monitor.log
```

## 🛠️ การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **Pipeline ล้มเหลว**
   - ตรวจสอบ SSH key ถูกต้อง
   - ตรวจสอบ SSH_HOST และ SSH_USER
   - ตรวจสอบ permissions ของ thaihand user

2. **Container ไม่ start**
   - ตรวจสอบ .env file
   - ตรวจสอบ docker-compose.yml
   - ดู logs: `docker-compose logs`

3. **SSL Certificate ไม่ทำงาน**
   - ตรวจสอบ DNS settings
   - รัน: `certbot --nginx -d thaihand.shop`

4. **Database Migration ล้มเหลว**
   - ตรวจสอบ DATABASE_URL
   - รัน: `docker-compose exec backend alembic upgrade head`

### การ Debug

```bash
# ดู GitLab CI/CD logs
# ไปที่ GitLab → CI/CD → Jobs

# ดู server logs
sudo -u thaihand docker-compose logs -f backend
sudo -u thaihand docker-compose logs -f frontend

# ตรวจสอบ network
curl -f http://localhost:8000/health
curl -f http://localhost:3000

# ตรวจสอบ nginx
sudo nginx -t
sudo systemctl status nginx
```

## 🔒 ความปลอดภัย

### Firewall Rules
- Port 22 (SSH) - จำกัด IP ที่เข้าถึงได้
- Port 80 (HTTP) - สำหรับ redirect ไป HTTPS
- Port 443 (HTTPS) - สำหรับ application

### SSL/TLS
- ใช้ Let's Encrypt certificates
- Auto-renewal ทุก 90 วัน
- HSTS headers

### Monitoring
- Fail2ban สำหรับป้องกัน brute force
- Log rotation
- Disk space monitoring
- Memory usage monitoring

## 📊 การ Monitor และ Alert

### Health Checks
- Application health: `https://thaihand.shop/health`
- Container status: `docker-compose ps`
- System resources: `htop`, `df -h`

### Logs
- Application logs: `/var/log/thaihand/`
- Nginx logs: `/var/log/nginx/`
- System logs: `journalctl -u thaihand.service`

### Backup Strategy
- Automatic backups ก่อน deployment
- เก็บ backup ไว้ 5 ครั้งล่าสุด
- Database backup ทุกวัน

## 🚀 การ Scale

### Vertical Scaling
- เพิ่ม RAM และ CPU ให้ droplet
- Optimize Docker containers
- ใช้ CDN สำหรับ static files

### Horizontal Scaling
- ใช้ load balancer
- Deploy หลาย droplets
- ใช้ managed database service

## 📝 หมายเหตุ

- ตรวจสอบ GitLab CI/CD variables ทุกครั้งก่อน deploy
- เก็บ backup ไว้เสมอ
- Monitor system resources อย่างสม่ำเสมอ
- Update security patches เป็นประจำ
