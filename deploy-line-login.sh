#!/bin/bash

# Script สำหรับ Deploy และ Restart Services หลังจากแก้ไข Line Login
# Usage: ./deploy-line-login.sh

set -e

echo "🚀 เริ่มต้นการ Deploy Line Login ใหม่..."

# ตรวจสอบว่าอยู่ใน directory ที่ถูกต้อง
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ ไม่พบไฟล์ docker-compose.yml กรุณาไปที่ root directory ของโปรเจค"
    exit 1
fi

# ตรวจสอบ environment variables
echo "📋 ตรวจสอบ Environment Variables..."

required_vars=(
    "LINE_CLIENT_ID"
    "LINE_CLIENT_SECRET"
    "NEXTAUTH_SECRET"
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Environment Variables ที่ขาดหายไป:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo "กรุณาตั้งค่า Environment Variables ในไฟล์ .env"
    exit 1
fi

echo "✅ Environment Variables ครบถ้วน"

# Stop services ปัจจุบัน
echo "🛑 หยุด Services ปัจจุบัน..."
docker-compose down

# Build images ใหม่
echo "🔨 Build Images ใหม่..."
docker-compose build --no-cache

# Start services
echo "🚀 เริ่มต้น Services..."
docker-compose up -d

# รอให้ services พร้อมใช้งาน
echo "⏳ รอให้ Services พร้อมใช้งาน..."
sleep 30

# ตรวจสอบ health ของ services
echo "🏥 ตรวจสอบ Health ของ Services..."

# ตรวจสอบ frontend
echo "ตรวจสอบ Frontend..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Frontend พร้อมใช้งาน"
else
    echo "❌ Frontend มีปัญหา"
    docker-compose logs frontend
fi

# ตรวจสอบ backend
echo "ตรวจสอบ Backend..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend พร้อมใช้งาน"
else
    echo "❌ Backend มีปัญหา"
    docker-compose logs backend
fi

# ตรวจสอบ database
echo "ตรวจสอบ Database..."
if docker-compose exec postgres pg_isready -U thaihand_user -d thaihand_db > /dev/null 2>&1; then
    echo "✅ Database พร้อมใช้งาน"
else
    echo "❌ Database มีปัญหา"
    docker-compose logs postgres
fi

# ตรวจสอบ nginx
echo "ตรวจสอบ Nginx..."
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Nginx พร้อมใช้งาน"
else
    echo "❌ Nginx มีปัญหา"
    docker-compose logs nginx
fi

# แสดง status ของ services
echo "📊 Status ของ Services:"
docker-compose ps

# แสดง logs ของ services
echo "📝 Logs ของ Services:"
echo "Frontend Logs:"
docker-compose logs --tail=20 frontend

echo ""
echo "Backend Logs:"
docker-compose logs --tail=20 backend

echo ""
echo "Database Logs:"
docker-compose logs --tail=10 postgres

echo ""
echo "Nginx Logs:"
docker-compose logs --tail=10 nginx

# ทดสอบ Line Login
echo "🧪 ทดสอบ Line Login..."
echo "ไปที่ http://localhost:3000/login เพื่อทดสอบ Line Login"

# แสดงข้อมูลการตั้งค่า
echo ""
echo "📋 ข้อมูลการตั้งค่า:"
echo "Frontend URL: http://localhost:3000"
echo "Backend URL: http://localhost:8000"
echo "Database: localhost:5432"
echo "Nginx: http://localhost"

echo ""
echo "🎉 การ Deploy เสร็จสิ้น!"
echo "หากมีปัญหา กรุณาตรวจสอบ logs ด้านบน" 