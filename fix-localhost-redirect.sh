#!/bin/bash

echo "🔧 แก้ไขปัญหา Localhost Redirect..."

echo ""
echo "📋 ตรวจสอบ environment variables..."
echo "NEXTAUTH_URL should be https://thaihand.shop"
docker-compose exec frontend env | grep NEXTAUTH_URL

echo ""
echo "🔄 Restart containers..."
docker-compose down
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
echo "✅ การแก้ไขเสร็จสิ้น!"
echo ""
echo "🌐 ทดสอบ: https://thaihand.shop/login"
echo "📱 ตรวจสอบว่า redirect ไม่ไป localhost อีกต่อไป" 