# ThaiHand - แพลตฟอร์มขนส่งสินค้า

แพลตฟอร์มขนส่งสินค้าที่เชื่อมต่อระหว่างผู้ส่งและผู้ขนส่งสินค้า

## 🚀 Features

- **ระบบจัดการคำขอขนส่ง**: สร้างและจัดการคำขอขนส่งสินค้า
- **ระบบจัดการเส้นทาง**: จัดการเส้นทางขนส่งและตารางเวลา
- **ระบบแจ้งเตือน**: แจ้งเตือนแบบ real-time
- **ระบบ Authentication**: เข้าสู่ระบบด้วย Google และ LINE
- **ระบบจัดการรายได้**: ติดตามรายได้และสถิติการทำงาน
- **ระบบ Marketplace**: ตลาดกลางสำหรับผู้ขนส่งและผู้ส่ง

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **NextAuth.js** - Authentication
- **Supabase** - File storage

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL** - Database
- **Alembic** - Database migrations
- **Docker** - Containerization

### Infrastructure
- **Digital Ocean** - Cloud hosting
- **GitLab CI/CD** - Continuous deployment
- **Nginx** - Reverse proxy
- **Let's Encrypt** - SSL certificates

## 📦 การติดตั้ง

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Git

### Development Setup

1. **Clone repository:**
```bash
git clone https://gitlab.com/YOUR_USERNAME/thaihand.git
cd thaihand
```

2. **Setup environment variables:**
```bash
cp backend/env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. **Start development environment:**
```bash
docker-compose up -d
```

4. **Run database migrations:**
```bash
docker-compose exec backend alembic upgrade head
```

5. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Database: localhost:5432

## 🚀 Production Deployment

### GitLab CI/CD Setup

โปรเจคนี้ใช้ GitLab CI/CD สำหรับ Continuous Deployment บน Digital Ocean droplets

#### ขั้นตอนการตั้งค่า:

1. **เตรียม Digital Ocean Droplet:**
```bash
# Clone โปรเจคบน droplet
git clone https://gitlab.com/YOUR_USERNAME/thaihand.git /opt/thaihand

# รัน setup script
chmod +x scripts/setup-droplet.sh
./scripts/setup-droplet.sh
```

2. **ตั้งค่า GitLab CI/CD Variables:**
ไปที่ GitLab repository → Settings → CI/CD → Variables

เพิ่ม variables ต่อไปนี้:
- `SSH_PRIVATE_KEY` - SSH private key สำหรับเชื่อมต่อ droplet
- `SSH_HOST` - IP address ของ droplet
- `SSH_USER` - username (thaihand)
- `SSH_KNOWN_HOSTS` - SSH known hosts

3. **ตั้งค่า Environment Variables:**
สร้างไฟล์ `.env` บน droplet:
```bash
sudo -u thaihand nano /opt/thaihand/.env
```

4. **Deploy:**
```bash
# Push ไปยัง main branch เพื่อ trigger deployment
git push origin main
```

#### การจัดการ Deployment:

```bash
# ตรวจสอบสถานะ
sudo -u thaihand /opt/thaihand/scripts/deploy.sh status

# Deploy ใหม่
sudo -u thaihand /opt/thaihand/scripts/deploy.sh deploy

# Rollback
sudo -u thaihand /opt/thaihand/scripts/deploy.sh rollback
```

### Manual Deployment

หากไม่ใช้ GitLab CI/CD สามารถ deploy แบบ manual ได้:

```bash
# บน droplet
cd /opt/thaihand
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 โครงสร้างโปรเจค

```
thaihand/
├── backend/                 # FastAPI backend
│   ├── main.py             # FastAPI application
│   ├── models.py           # Database models
│   ├── schemas.py          # Pydantic schemas
│   ├── crud.py            # Database operations
│   ├── auth.py            # Authentication
│   ├── routers.py         # API routes
│   └── requirements.txt   # Python dependencies
├── frontend/               # Next.js frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/              # Utility functions
│   └── package.json      # Node.js dependencies
├── nginx/                 # Nginx configuration
├── scripts/               # Deployment scripts
│   ├── deploy.sh         # Deployment script
│   └── setup-droplet.sh  # Droplet setup script
├── docs/                  # Documentation
├── docker-compose.yml     # Development environment
├── docker-compose.prod.yml # Production environment
└── .gitlab-ci.yml        # GitLab CI/CD pipeline
```

## 🔧 การพัฒนา

### การรัน Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
pytest
```

### การรัน Linting

```bash
# Frontend linting
cd frontend
npm run lint

# Backend linting
cd backend
flake8 .
```

### Database Migrations

```bash
# สร้าง migration ใหม่
docker-compose exec backend alembic revision --autogenerate -m "Description"

# รัน migrations
docker-compose exec backend alembic upgrade head

# Rollback migration
docker-compose exec backend alembic downgrade -1
```

## 📊 Monitoring

### Health Checks
- Application: `https://thaihand.shop/health`
- Container status: `docker-compose ps`
- System resources: `htop`, `df -h`

### Logs
```bash
# Application logs
docker-compose logs -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log

# System logs
journalctl -u thaihand.service
```

## 🔒 Security

- **SSL/TLS**: Let's Encrypt certificates
- **Firewall**: UFW configuration
- **Fail2ban**: Brute force protection
- **Docker**: Container isolation
- **Environment variables**: Secure configuration

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a merge request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

หากมีปัญหาหรือคำถาม:
- สร้าง issue ใน GitLab repository
- ติดต่อทีมพัฒนา
- ดูเอกสารใน `/docs/` directory

## 🔄 CI/CD Pipeline

### Stages:
1. **Test** - รัน tests และ linting
2. **Build** - Build Docker images และ push ไปยัง GitLab registry
3. **Deploy** - Deploy ไปยัง Digital Ocean droplet

### Triggers:
- Push ไปยัง `main` branch
- Manual deployment จาก GitLab UI

### Features:
- Automatic backup ก่อน deployment
- Health checks หลัง deployment
- Rollback capability
- Logging และ monitoring
