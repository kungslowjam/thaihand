# Quick Start Guide - GitLab CI/CD Deployment

คู่มือการตั้งค่า GitLab CI/CD สำหรับ ThaiHand แบบรวดเร็ว

## ⚡ ขั้นตอนด่วน (5 นาที)

### 1. เตรียม Digital Ocean Droplet

```bash
# สร้าง Ubuntu 22.04 LTS droplet
# ขนาด: 2GB RAM, 1 vCPU, 50GB SSD
# เปิด port: 22, 80, 443
```

### 2. เตรียม Server

```bash
# เชื่อมต่อ SSH
ssh root@YOUR_DROPLET_IP

# Clone โปรเจค
git clone https://gitlab.com/YOUR_USERNAME/thaihand.git /opt/thaihand

# รัน setup script
cd /opt/thaihand
chmod +x scripts/setup-droplet.sh
./scripts/setup-droplet.sh
```

### 3. สร้าง SSH Key

```bash
# สร้าง SSH key สำหรับ GitLab CI/CD
sudo -u thaihand ssh-keygen -t rsa -b 4096 -C "gitlab-ci@thaihand.shop"
sudo -u thaihand cat /home/thaihand/.ssh/id_rsa.pub >> /home/thaihand/.ssh/authorized_keys

# แสดง private key (คัดลอกไปใช้ใน GitLab)
sudo -u thaihand cat /home/thaihand/.ssh/id_rsa
```

### 4. ตั้งค่า GitLab Variables

ไปที่ GitLab repository → Settings → CI/CD → Variables

เพิ่ม variables:

| Variable | Value |
|----------|-------|
| `SSH_PRIVATE_KEY` | เนื้อหา private key จากขั้นตอนที่ 3 |
| `SSH_HOST` | IP ของ droplet |
| `SSH_USER` | `thaihand` |
| `SSH_KNOWN_HOSTS` | `ssh-keyscan YOUR_DROPLET_IP` |

### 5. ตั้งค่า Environment

```bash
# สร้าง .env file
sudo -u thaihand nano /opt/thaihand/.env
```

เพิ่ม environment variables ที่จำเป็น (ดู docs/gitlab-cd-setup.md)

### 6. Deploy

```bash
# Push ไปยัง main branch
git add .
git commit -m "Initial deployment"
git push origin main
```

## ✅ ตรวจสอบการทำงาน

### 1. ตรวจสอบ Pipeline
- ไปที่ GitLab → CI/CD → Pipelines
- ดูว่า pipeline ทำงานสำเร็จหรือไม่

### 2. ตรวจสอบ Application
```bash
# บน droplet
sudo -u thaihand /opt/thaihand/scripts/deploy.sh status

# ตรวจสอบ website
curl -f https://thaihand.shop/health
```

### 3. ตั้งค่า SSL (ถ้ายังไม่ได้)
```bash
# หลังจาก DNS ชี้มาที่ server แล้ว
certbot --nginx -d thaihand.shop -d www.thaihand.shop
```

## 🚨 การแก้ไขปัญหาแบบด่วน

### Pipeline ล้มเหลว
```bash
# ตรวจสอบ SSH connection
ssh thaihand@YOUR_DROPLET_IP

# ตรวจสอบ permissions
ls -la /opt/thaihand/
```

### Application ไม่ทำงาน
```bash
# ตรวจสอบ containers
sudo -u thaihand docker-compose ps

# ดู logs
sudo -u thaihand docker-compose logs -f

# Restart
sudo -u thaihand docker-compose restart
```

### SSL ไม่ทำงาน
```bash
# ตรวจสอบ DNS
nslookup thaihand.shop

# รัน certbot อีกครั้ง
certbot --nginx -d thaihand.shop
```

## 📞 คำสั่งที่มีประโยชน์

```bash
# ตรวจสอบสถานะ
sudo -u thaihand /opt/thaihand/scripts/deploy.sh status

# Deploy ใหม่
sudo -u thaihand /opt/thaihand/scripts/deploy.sh deploy

# Rollback
sudo -u thaihand /opt/thaihand/scripts/deploy.sh rollback

# ดู logs
sudo -u thaihand docker-compose logs -f

# ดู system resources
htop
df -h
free -h
```

## 🎯 สิ่งที่ได้หลังการตั้งค่า

✅ **Automatic Deployment** - Deploy อัตโนมัติเมื่อ push ไปยัง main branch  
✅ **SSL Certificate** - HTTPS ด้วย Let's Encrypt  
✅ **Health Monitoring** - ตรวจสอบสถานะ application  
✅ **Backup System** - Automatic backup ก่อน deployment  
✅ **Rollback Capability** - สามารถ rollback ได้หากมีปัญหา  
✅ **Security** - Firewall, Fail2ban, Docker isolation  

## 📚 เอกสารเพิ่มเติม

- [GitLab CI/CD Setup Guide](gitlab-cd-setup.md)
- [Troubleshooting Guide](troubleshooting.md)
- [Security Best Practices](security.md)

## 🆘 ติดต่อ Support

หากมีปัญหา:
1. ดู logs: `sudo -u thaihand docker-compose logs -f`
2. ตรวจสอบ GitLab CI/CD pipeline
3. สร้าง issue ใน GitLab repository
4. ติดต่อทีมพัฒนา
