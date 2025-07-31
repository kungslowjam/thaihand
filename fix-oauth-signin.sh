#!/bin/bash

echo "🔧 กำลังแก้ไขปัญหา OAuthSignin error..."

# ตรวจสอบ environment variables
echo "🔍 ตรวจสอบ environment variables..."
if [ -f .env ]; then
    echo "✅ ไฟล์ .env พบ"
    grep -E "LINE_|NEXTAUTH_" .env
else
    echo "❌ ไม่พบไฟล์ .env"
    exit 1
fi

# ตรวจสอบ LINE Client ID และ Secret
echo "🔍 ตรวจสอบ LINE OAuth credentials..."
LINE_CLIENT_ID=$(grep LINE_CLIENT_ID .env | cut -d'=' -f2)
LINE_CLIENT_SECRET=$(grep LINE_CLIENT_SECRET .env | cut -d'=' -f2)

if [ -z "$LINE_CLIENT_ID" ] || [ "$LINE_CLIENT_ID" = "your-line-client-id" ]; then
    echo "❌ LINE_CLIENT_ID ไม่ถูกตั้งค่า"
    exit 1
fi

if [ -z "$LINE_CLIENT_SECRET" ] || [ "$LINE_CLIENT_SECRET" = "your-line-client-secret" ]; then
    echo "❌ LINE_CLIENT_SECRET ไม่ถูกตั้งค่า"
    exit 1
fi

echo "✅ LINE OAuth credentials ถูกต้อง"

# หยุด containers
echo "⏹️  หยุด containers..."
docker-compose down

# ลบ images เพื่อ rebuild
echo "🗑️  ลบ frontend image..."
docker rmi thaihand-frontend 2>/dev/null || true

# ล้าง cache
echo "🧹 ล้าง cache..."
docker system prune -f

# Rebuild และ start containers
echo "🔨  Rebuild และ start containers..."
docker-compose up --build -d

# รอให้ containers เริ่มทำงาน
echo "⏳ รอให้ containers เริ่มทำงาน..."
sleep 20

# ตรวจสอบสถานะ
echo "📊 ตรวจสอบสถานะ containers..."
docker-compose ps

# ตรวจสอบการเชื่อมต่อ LINE
echo "🔍 ตรวจสอบการเชื่อมต่อ LINE..."
chmod +x check-line-connection.sh
./check-line-connection.sh

# แสดง logs ของ frontend
echo "📋 แสดง logs ของ frontend..."
docker-compose logs frontend --tail=30

echo "✅ เสร็จสิ้น! กรุณาตรวจสอบ logs ด้านบน"
echo "🌐 เข้าถึงเว็บไซต์ได้ที่: https://thaihand.shop"
echo "🔍 หากยังมีปัญหา ให้ตรวจสอบ:"
echo "   1. LINE Developer Console - Callback URL"
echo "   2. LINE Client ID และ Secret ใน .env"
echo "   3. Network connectivity" 