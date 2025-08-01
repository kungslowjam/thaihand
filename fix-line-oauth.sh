#!/bin/bash

echo "🔧 แก้ไขปัญหา LINE OAuth Authentication..."

# หยุด containers
echo "🛑 หยุด containers..."
docker-compose down

# ลบ frontend image
echo "🗑️ ลบ frontend image..."
docker rmi thaihand-frontend 2>/dev/null || true

# ล้าง cache
echo "🧹 ล้าง cache..."
docker system prune -f

# ตรวจสอบไฟล์ .env
echo "📋 ตรวจสอบไฟล์ .env..."
if [ ! -f .env ]; then
    echo "❌ ไม่พบไฟล์ .env"
    echo "📝 สร้างไฟล์ .env จาก env.example..."
    cp frontend/env.example .env
    echo "⚠️ กรุณาแก้ไขไฟล์ .env และใส่ LINE_CLIENT_ID และ LINE_CLIENT_SECRET ที่ถูกต้อง"
    echo "📖 วิธีตั้งค่า LINE OAuth:"
    echo "1. ไปที่ https://developers.line.biz/"
    echo "2. สร้าง Channel ใหม่"
    echo "3. ตั้งค่า Callback URL เป็น: https://thaihand.shop/api/auth/callback/line"
    echo "4. คัดลอก Channel ID และ Channel Secret ไปใส่ใน .env"
    exit 1
fi

# ตรวจสอบ LINE environment variables
echo "🔍 ตรวจสอบ LINE environment variables..."
if ! grep -q "LINE_CLIENT_ID" .env || ! grep -q "LINE_CLIENT_SECRET" .env; then
    echo "❌ ไม่พบ LINE_CLIENT_ID หรือ LINE_CLIENT_SECRET ใน .env"
    echo "⚠️ กรุณาเพิ่ม LINE_CLIENT_ID และ LINE_CLIENT_SECRET ในไฟล์ .env"
    exit 1
fi

# Rebuild และ start
echo "🚀 Rebuild และ start containers..."
docker-compose up --build -d

# รอให้ containers เริ่มต้น
echo "⏳ รอให้ containers เริ่มต้น..."
sleep 10

# ตรวจสอบ logs
echo "📊 ตรวจสอบ logs..."
docker-compose logs frontend --tail=20

echo ""
echo "✅ เสร็จสิ้นการแก้ไขปัญหา!"
echo ""
echo "🔍 ตรวจสอบการทำงาน:"
echo "1. เปิดเบราว์เซอร์ไปที่ https://thaihand.shop/login"
echo "2. กดปุ่ม 'เข้าสู่ระบบด้วย LINE'"
echo "3. ตรวจสอบ logs: docker-compose logs frontend --tail=30"
echo ""
echo "📋 หากยังมีปัญหา ให้ตรวจสอบ:"
echo "- LINE Developer Console settings"
echo "- Callback URL: https://thaihand.shop/api/auth/callback/line"
echo "- Environment variables ใน .env" 