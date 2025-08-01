#!/bin/bash

echo "🔄 Restart และ Rebuild ThaiHand Application..."

echo ""
echo "📦 หยุด containers..."
docker-compose down

echo ""
echo "🧹 ล้าง cache..."
docker system prune -f

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
docker-compose logs --tail=20

echo ""
echo "✅ การ Restart เสร็จสิ้น!"
echo ""
echo "🌐 ทดสอบเว็บไซต์: https://thaihand.shop"
echo "🔐 ทดสอบ Login: https://thaihand.shop/login" 