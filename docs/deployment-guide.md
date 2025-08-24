# Deployment Guide - ThaiHand

คู่มือการ deploy ระบบ ThaiHand บน Digital Ocean VPS

## 📋 Prerequisites

- Digital Ocean VPS (Ubuntu 22.04 LTS)
- Domain name (thaihand.shop)
- GitHub repository access
- SSH key configured

## 🚀 Initial Server Setup

### 1. Connect to your VPS
```bash
ssh root@your-server-ip
```

### 2. Run the setup script
```bash
# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/your-username/thaihand/main/scripts/setup-droplet.sh | bash
```

หรือ clone repository และรัน:
```bash
git clone https://github.com/your-username/thaihand.git
cd thaihand
chmod +x scripts/setup-droplet.sh
./scripts/setup-droplet.sh
```

### 3. Initialize the project
```bash
# Switch to thaihand user
su - thaihand

# Run initialization script
cd /opt/thaihand
chmod +x scripts/init-project.sh
./scripts/init-project.sh
```

### 4. Configure environment variables
```bash
# Edit .env file
nano .env
```

ตัวอย่างการตั้งค่า:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/thaihand

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_URL=https://thaihand.shop
NEXTAUTH_SECRET=your_nextauth_secret

# API
NEXT_PUBLIC_API_URL=https://thaihand.shop/api

# Line Login
LINE_CLIENT_ID=your_line_client_id
LINE_CLIENT_SECRET=your_line_client_secret

# Google Login
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 5. Start the application
```bash
# Start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 6. Set up SSL certificate
```bash
# Switch back to root
exit

# Set up SSL
certbot --nginx -d thaihand.shop -d www.thaihand.shop
```

## 🔄 Automated Deployment

### 1. Configure GitHub Secrets

ไปที่ GitHub repository → Settings → Secrets and variables → Actions และเพิ่ม:

- `HOST`: IP address ของ server
- `USERNAME`: username สำหรับ SSH (root หรือ thaihand)
- `SSH_KEY`: Private SSH key

### 2. Push to main branch

การ push ไปยัง main branch จะ trigger deployment อัตโนมัติ

## 🛠️ Manual Commands

### Check application status
```bash
# Check container status
docker-compose ps

# Check system service
systemctl status thaihand

# Check nginx status
systemctl status nginx
```

### View logs
```bash
# Application logs
docker-compose logs -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -u thaihand -f
```

### Manual deployment
```bash
# Run deployment script
/opt/deploy.sh

# Or manual steps
cd /opt/thaihand
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup and restore
```bash
# Create backup
/opt/backup.sh

# List backups
ls -la /opt/backups/

# Restore from backup
# (Manual process - copy files from backup directory)
```

## 🔧 Troubleshooting

### Common issues

#### 1. Port already in use
```bash
# Check what's using the port
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Kill process if needed
sudo kill -9 <PID>
```

#### 2. Docker permission issues
```bash
# Add user to docker group
sudo usermod -aG docker thaihand

# Restart docker service
sudo systemctl restart docker
```

#### 3. Nginx configuration issues
```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

#### 4. SSL certificate issues
```bash
# Renew SSL certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Health checks

#### Application health
```bash
# Check if application is responding
curl -f http://localhost:8000/health

# Check if frontend is responding
curl -f http://localhost:3000
```

#### Database health
```bash
# Check database connection
docker-compose exec backend python -c "from database import engine; print(engine.execute('SELECT 1').scalar())"
```

## 📊 Monitoring

### System monitoring
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
htop

# Check running processes
ps aux | grep thaihand
```

### Application monitoring
```bash
# Monitor logs in real-time
docker-compose logs -f --tail=100

# Check container resource usage
docker stats
```

## 🔒 Security

### Firewall
```bash
# Check firewall status
sudo ufw status

# Allow additional ports if needed
sudo ufw allow <port>
```

### SSL/TLS
```bash
# Check SSL certificate
openssl s_client -connect thaihand.shop:443 -servername thaihand.shop

# Test SSL configuration
curl -I https://thaihand.shop
```

## 📝 Maintenance

### Regular maintenance tasks

#### Daily
- Check application logs for errors
- Monitor system resources

#### Weekly
- Review and clean up old Docker images
- Check backup status

#### Monthly
- Update system packages
- Renew SSL certificates
- Review security logs

### Update procedures

#### System updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart services if needed
sudo systemctl restart nginx
sudo systemctl restart docker
```

#### Application updates
```bash
# Pull latest code and deploy
cd /opt/thaihand
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📞 Support

หากมีปัญหาในการ deploy สามารถ:

1. ตรวจสอบ logs: `docker-compose logs -f`
2. ตรวจสอบ system status: `systemctl status thaihand`
3. ตรวจสอบ nginx status: `systemctl status nginx`
4. ตรวจสอบ firewall: `ufw status`

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Digital Ocean Documentation](https://docs.digitalocean.com/)
