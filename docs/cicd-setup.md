# การตั้งค่า CI/CD Pipeline สำหรับ ThaiHand

เอกสารนี้จะอธิบายการตั้งค่า Continuous Integration และ Continuous Deployment (CI/CD) สำหรับโปรเจค ThaiHand

## 📋 สิ่งที่ต้องเตรียม

### 1. GitHub Repository
- โปรเจคต้องอยู่ใน GitHub repository
- เปิดใช้งาน GitHub Actions

### 2. Docker Hub Account
- สร้าง Docker Hub account
- สร้าง repository สำหรับ images

### 3. Digital Ocean Droplet
- สร้าง droplet สำหรับ production
- สร้าง droplet สำหรับ staging (ถ้าต้องการ)

### 4. Domain และ SSL
- จัดเตรียม domain (เช่น thaihand.shop)
- ตั้งค่า DNS ให้ชี้ไปยัง droplet

## 🔧 การตั้งค่า GitHub Secrets

ไปที่ GitHub repository → Settings → Secrets and variables → Actions

### Production Secrets
```
DEPLOY_HOST=your-production-server-ip
DEPLOY_USER=thaihand
DEPLOY_SSH_KEY=your-ssh-private-key
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Staging Secrets (ถ้ามี)
```
STAGING_HOST=your-staging-server-ip
STAGING_USER=thaihand
STAGING_SSH_KEY=your-staging-ssh-private-key
```

## 🚀 การตั้งค่า Server

### 1. รัน Setup Script
```bash
# บน Digital Ocean droplet
sudo chmod +x scripts/setup-droplet.sh
sudo ./scripts/setup-droplet.sh
```

### 2. ตั้งค่า Environment Variables
```bash
# Copy environment template
cp env.production.example .env

# แก้ไขค่าใน .env file
nano .env
```

### 3. ตั้งค่า SSL Certificate
```bash
# หลังจากตั้งค่า DNS แล้ว
sudo certbot --nginx -d thaihand.shop -d www.thaihand.shop
```

## 📊 CI/CD Pipeline Stages

### 1. Test Stage
- รัน unit tests สำหรับ frontend และ backend
- รัน linting และ code quality checks
- Security scanning

### 2. Build Stage
- Build Docker images
- Push images ไปยัง Docker Hub
- Tag images ด้วย commit SHA

### 3. Deploy Stage
- Deploy ไปยัง staging (develop branch)
- Deploy ไปยัง production (main branch)
- Health checks และ rollback

## 🔄 Workflow Triggers

### Automatic Deployment
- **Production**: เมื่อ push ไปยัง `main` branch
- **Staging**: เมื่อ push ไปยัง `develop` หรือ `staging` branch

### Manual Deployment
- สามารถ trigger deployment ได้จาก GitHub Actions UI
- ใช้ `workflow_dispatch` event

## 📁 ไฟล์ที่เกี่ยวข้อง

### GitHub Actions Workflows
```
.github/workflows/
├── deploy.yml          # Production deployment
├── staging.yml         # Staging deployment
└── security.yml        # Security scanning
```

### Docker Configuration
```
docker-compose.prod.yml     # Production environment
env.production.example      # Environment variables template
```

### Scripts
```
scripts/
├── deploy.sh          # Deployment script
├── backup.sh          # Backup script
├── monitor.sh         # Monitoring script
└── setup-droplet.sh   # Server setup script
```

## 🛠️ การใช้งาน

### 1. Development Workflow
```bash
# สร้าง feature branch
git checkout -b feature/new-feature

# ทำการเปลี่ยนแปลง
git add .
git commit -m "Add new feature"

# Push และสร้าง Pull Request
git push origin feature/new-feature
```

### 2. Staging Deployment
```bash
# Merge ไปยัง develop branch
git checkout develop
git merge feature/new-feature
git push origin develop
```

### 3. Production Deployment
```bash
# Merge ไปยัง main branch
git checkout main
git merge develop
git push origin main
```

## 📈 Monitoring และ Alerting

### 1. Health Checks
- Application health endpoints
- Container status monitoring
- Database connectivity checks

### 2. System Monitoring
- CPU, Memory, Disk usage
- SSL certificate expiry
- Backup status

### 3. Alerting
- Slack notifications
- Email alerts (ถ้าต้องการ)
- SMS alerts (ถ้าต้องการ)

## 🔒 Security Features

### 1. Security Scanning
- Trivy vulnerability scanner
- Bandit security linter
- npm audit และ safety checks

### 2. Code Quality
- ESLint และ Prettier
- Black และ isort
- MyPy type checking

### 3. Container Security
- Multi-stage builds
- Non-root users
- Minimal base images

## 📊 Backup Strategy

### 1. Database Backups
- Daily automated backups
- S3 storage integration
- Retention policy (30 days)

### 2. Configuration Backups
- Docker Compose files
- Environment variables
- SSL certificates

### 3. Disaster Recovery
- Automated rollback capability
- Backup restoration scripts
- Cross-region backups

## 🚨 Troubleshooting

### 1. Deployment Failures
```bash
# ตรวจสอบ deployment status
sudo -u thaihand /opt/thaihand/scripts/deploy.sh status

# ดู logs
docker-compose -f /opt/thaihand/docker-compose.prod.yml logs

# Rollback
sudo -u thaihand /opt/thaihand/scripts/deploy.sh rollback
```

### 2. Health Check Failures
```bash
# ตรวจสอบ container status
docker ps

# ตรวจสอบ application health
curl -f http://localhost:8000/health
curl -f http://localhost:3000/api/health

# ตรวจสอบ database
docker-compose exec postgres pg_isready
```

### 3. Monitoring Issues
```bash
# ตรวจสอบ monitoring logs
tail -f /var/log/thaihand-monitor.log

# รัน monitoring manually
sudo -u thaihand /opt/thaihand/scripts/monitor.sh monitor
```

## 📝 Best Practices

### 1. Code Quality
- เขียน tests สำหรับทุก feature
- ใช้ linting tools
- Review code ก่อน merge

### 2. Security
- ใช้ environment variables
- ไม่ commit secrets
- รัน security scans อย่างสม่ำเสมอ

### 3. Deployment
- ใช้ blue-green deployment
- มี rollback plan
- Monitor หลัง deployment

### 4. Monitoring
- ตั้งค่า alerting thresholds
- ตรวจสอบ logs อย่างสม่ำเสมอ
- มี incident response plan

## 🔄 การอัพเดท Pipeline

### 1. เพิ่ม Environment ใหม่
1. สร้าง workflow file ใหม่
2. เพิ่ม secrets ที่จำเป็น
3. ทดสอบใน staging ก่อน

### 2. เปลี่ยน Infrastructure
1. อัพเดท docker-compose files
2. ทดสอบใน staging
3. Deploy ไปยัง production

### 3. เพิ่ม Monitoring
1. อัพเดท monitor.sh script
2. เพิ่ม alerting rules
3. ทดสอบ monitoring

## 📞 Support

หากมีปัญหาหรือคำถาม:
- สร้าง issue ใน GitHub repository
- ตรวจสอบ logs และ monitoring
- ติดต่อทีม DevOps
