#!/bin/bash

echo "🔧 แก้ไขปัญหา OAuth Authentication..."

# ตรวจสอบไฟล์ .env
if [ ! -f .env ]; then
    echo "❌ ไม่พบไฟล์ .env"
    echo "📝 สร้างไฟล์ .env จาก .env.example"
    echo "กรุณาสร้างไฟล์ .env และตั้งค่า environment variables"
    exit 1
fi

echo "✅ ไฟล์ .env พบ"

# ตรวจสอบ environment variables
echo ""
echo "🔍 ตรวจสอบ Environment Variables..."

# ตรวจสอบ NextAuth
if grep -q "NEXTAUTH_URL" .env && grep -q "NEXTAUTH_SECRET" .env; then
    echo "✅ NextAuth configuration พบ"
else
    echo "❌ NextAuth configuration ไม่ครบ"
    echo "กรุณาเพิ่ม NEXTAUTH_URL และ NEXTAUTH_SECRET ใน .env"
fi

# ตรวจสอบ Google OAuth
if grep -q "GOOGLE_CLIENT_ID" .env && grep -q "GOOGLE_CLIENT_SECRET" .env; then
    echo "✅ Google OAuth configuration พบ"
else
    echo "❌ Google OAuth configuration ไม่ครบ"
    echo "กรุณาเพิ่ม GOOGLE_CLIENT_ID และ GOOGLE_CLIENT_SECRET ใน .env"
fi

# ตรวจสอบ LINE OAuth
if grep -q "LINE_CLIENT_ID" .env && grep -q "LINE_CLIENT_SECRET" .env; then
    echo "✅ LINE OAuth configuration พบ"
else
    echo "❌ LINE OAuth configuration ไม่ครบ"
    echo "กรุณาเพิ่ม LINE_CLIENT_ID และ LINE_CLIENT_SECRET ใน .env"
fi

# หยุด containers
echo ""
echo "🛑 หยุด containers..."
docker-compose down

# ลบ images
echo "🗑️ ลบ images..."
docker-compose down --rmi all

# ล้าง cache
echo "🧹 ล้าง cache..."
docker system prune -f

# Rebuild และ start
echo "🔨 Rebuild และ start containers..."
docker-compose up --build -d

# รอให้ containers เริ่มต้น
echo "⏳ รอให้ containers เริ่มต้น..."
sleep 10

# ตรวจสอบ status
echo ""
echo "📊 ตรวจสอบ container status..."
docker-compose ps

# ตรวจสอบ logs
echo ""
echo "📋 ตรวจสอบ logs..."
echo "Frontend logs:"
docker-compose logs frontend --tail=10

echo ""
echo "Backend logs:"
docker-compose logs backend --tail=10

# ตรวจสอบ network connectivity
echo ""
echo "🌐 ตรวจสอบ network connectivity..."
docker-compose exec frontend ping -c 1 access.line.me
docker-compose exec frontend ping -c 1 api.line.me

echo ""
echo "✅ เสร็จสิ้นการแก้ไขปัญหา OAuth!"
echo ""
echo "🔗 ทดสอบการเข้าสู่ระบบที่: https://thaihand.shop/login"
echo "📝 ตรวจสอบ logs เพิ่มเติม: docker-compose logs frontend --tail=50" 