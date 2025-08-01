#!/bin/bash

echo "🔄 Restart ThaiHand Application..."

echo ""
echo "📦 หยุด containers..."
docker-compose down

echo ""
echo "🏗️  Build และ start containers ใหม่..."
docker-compose up -d --build

echo ""
echo "⏳ รอให้ containers เริ่มทำงาน..."
sleep 30

echo ""
echo "📊 ตรวจสอบสถานะ containers..."
docker-compose ps

echo ""
echo "📋 แสดง logs ล่าสุด..."
docker-compose logs --tail=10 frontend

echo ""
echo "✅ การ Restart เสร็จสิ้น!"
echo ""
echo "🌐 ทดสอบ: https://thaihand.shop/login"
echo "📱 ตรวจสอบ Callback URL ใน LINE Developers Console: https://thaihand.shop/api/auth/callback/line" 