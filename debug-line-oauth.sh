#!/bin/bash

echo "🔍 ตรวจสอบปัญหา LINE OAuth Timeout..."

# ตรวจสอบ environment variables
echo "📋 ตรวจสอบ Environment Variables:"
if [ -f .env ]; then
    echo "✅ ไฟล์ .env พบ"
    echo "LINE OAuth Configuration:"
    grep -E "LINE_|NEXTAUTH_" .env
else
    echo "❌ ไม่พบไฟล์ .env"
    exit 1
fi

echo ""
echo "🌐 ตรวจสอบการเชื่อมต่อ LINE API..."

# ตรวจสอบ DNS resolution
echo "🔍 ตรวจสอบ DNS Resolution:"
docker-compose exec frontend nslookup access.line.me
docker-compose exec frontend nslookup api.line.me

# ตรวจสอบ ping
echo "📡 ตรวจสอบ Ping:"
docker-compose exec frontend ping -c 3 access.line.me
docker-compose exec frontend ping -c 3 api.line.me

# ตรวจสอบ HTTP connectivity
echo "🌐 ตรวจสอบ HTTP Connectivity:"
docker-compose exec frontend curl -I --connect-timeout 10 --max-time 30 https://access.line.me
docker-compose exec frontend curl -I --connect-timeout 10 --max-time 30 https://api.line.me

# ตรวจสอบ logs ล่าสุด
echo "📋 ตรวจสอบ Logs ล่าสุด:"
docker-compose logs frontend --tail=20 | grep -i "line\|oauth\|error\|timeout"

echo ""
echo "🔧 เริ่มต้นการแก้ไขปัญหา..."

# หยุด containers
echo "🛑 หยุด containers..."
docker-compose down

# ลบ frontend image
echo "🗑️ ลบ frontend image..."
docker rmi thaihand-frontend 2>/dev/null || true

# ล้าง cache
echo "🧹 ล้าง cache..."
docker system prune -f

# Rebuild และ start
echo "🔨 Rebuild และ start containers..."
docker-compose up --build -d

# รอให้ containers เริ่มต้น
echo "⏳ รอให้ containers เริ่มต้น..."
sleep 45

# ตรวจสอบ logs หลัง restart
echo "📋 ตรวจสอบ Logs หลัง Restart:"
docker-compose logs frontend --tail=30

echo ""
echo "✅ เสร็จสิ้นการแก้ไขปัญหา!"
echo ""
echo "🔍 ตรวจสอบ logs เพิ่มเติม:"
echo "docker-compose logs frontend --tail=50"
echo ""
echo "🌐 ทดสอบ OAuth:"
echo "https://thaihand.shop/login" 