# ThaiHand - ระบบฝากหิ้วออนไลน์

ระบบฝากหิ้วออนไลน์ที่เชื่อมต่อผู้ซื้อกับผู้ขนส่งสินค้าจากต่างประเทศ

## 🚀 Quick Start

### สำหรับการ Deploy อย่างรวดเร็ว

```bash
# 1. Connect to your VPS
ssh root@your-server-ip

# 2. Run quick deploy script
curl -fsSL https://raw.githubusercontent.com/your-username/thaihand/main/scripts/quick-deploy.sh | bash
```

### สำหรับการ Deploy แบบ Step-by-Step

ดูคู่มือการ deploy อย่างละเอียดได้ที่ [Deployment Guide](docs/deployment-guide.md)

## 📋 Features

### สำหรับผู้ซื้อ
- 📦 สร้างคำขอฝากหิ้วสินค้า
- 🗺️ ระบุประเทศต้นทางและปลายทาง
- 💰 กำหนดงบประมาณ
- ⏰ ตั้งเวลาที่ต้องการรับของ
- 🔍 ค้นหาและติดต่อผู้ขนส่ง

### สำหรับผู้ขนส่ง
- 📋 ดูรายการคำขอฝากหิ้ว
- 💼 สร้างข้อเสนอราคา
- 📱 ติดต่อลูกค้า
- 📊 จัดการคำสั่งซื้อ
- 💰 ติดตามรายได้

### ระบบทั่วไป
- 🔐 ระบบ Authentication (Google, Line)
- 💬 ระบบแจ้งเตือน Real-time
- 📱 Responsive Design
- 🔒 ระบบความปลอดภัย
- 📊 Dashboard สำหรับติดตาม

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI Components
- **NextAuth.js** - Authentication
- **Socket.io** - Real-time communication

### Backend
- **FastAPI** - Python Web Framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM
- **Alembic** - Database Migrations
- **JWT** - Authentication
- **Supabase** - File Storage

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Reverse Proxy
- **Let's Encrypt** - SSL Certificates
- **Digital Ocean** - Cloud Hosting
- **GitHub Actions** - CI/CD

## 📁 Project Structure

```
thaihand/
├── frontend/                 # Next.js Frontend
│   ├── app/                 # App Router
│   ├── components/          # React Components
│   ├── lib/                 # Utilities
│   └── store/               # State Management
├── backend/                 # FastAPI Backend
│   ├── routers/             # API Routes
│   ├── models.py            # Database Models
│   ├── schemas.py           # Pydantic Schemas
│   └── crud.py              # Database Operations
├── scripts/                 # Deployment Scripts
│   ├── setup-droplet.sh     # Server Setup
│   ├── quick-deploy.sh      # Quick Deployment
│   └── deploy.sh            # Manual Deployment
├── docs/                    # Documentation
└── docker-compose.yml       # Docker Configuration
```

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL

### Local Development

1. **Clone Repository**
```bash
git clone https://github.com/your-username/thaihand.git
cd thaihand
```

2. **Setup Environment**
```bash
# Copy environment files
cp backend/env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit environment variables
nano backend/.env
nano frontend/.env
```

3. **Start with Docker**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

4. **Database Migrations**
```bash
# Run migrations
docker-compose exec backend alembic upgrade head

# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "description"
```

### Manual Development

1. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

## 🚀 Deployment

### Automated Deployment (Recommended)

1. **Setup GitHub Secrets**
   - `HOST`: Server IP address
   - `USERNAME`: SSH username
   - `SSH_KEY`: Private SSH key

2. **Push to main branch**
   - Automatic deployment will be triggered

### Manual Deployment

```bash
# On your server
cd /opt/thaihand
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Application health
curl http://localhost:8000/health

# Container status
docker-compose ps

# System resources
htop
df -h
```

### Logs
```bash
# Application logs
docker-compose logs -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log

# System logs
journalctl -u thaihand -f
```

### Backup
```bash
# Manual backup
/opt/backup.sh

# List backups
ls -la /opt/backups/
```

## 🔒 Security

- 🔐 JWT Authentication
- 🛡️ CORS Protection
- 🔒 HTTPS/SSL
- 🚫 SQL Injection Protection
- 🔑 Environment Variables
- 🛡️ Input Validation

## 📱 API Documentation

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user

### Request Endpoints
- `GET /requests` - List requests
- `POST /requests` - Create request
- `GET /requests/{id}` - Get request details
- `PUT /requests/{id}` - Update request
- `DELETE /requests/{id}` - Delete request

### Offer Endpoints
- `GET /offers` - List offers
- `POST /offers` - Create offer
- `GET /offers/{id}` - Get offer details
- `PUT /offers/{id}` - Update offer

### Notification Endpoints
- `GET /notifications` - List notifications
- `POST /notifications` - Create notification
- `PUT /notifications/{id}/read` - Mark as read

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 📧 Email: support@thaihand.shop
- 📱 Line: @thaihand
- 🌐 Website: https://thaihand.shop
- 📖 Documentation: [docs/](docs/)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React Framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python Web Framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Digital Ocean](https://www.digitalocean.com/) - Cloud Hosting

---

**ThaiHand** - เชื่อมต่อโลกการซื้อขายสินค้าจากต่างประเทศ 🇹🇭
