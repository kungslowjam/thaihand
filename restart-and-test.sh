#!/bin/bash

echo "🔄 Restart และทดสอบ LINE OAuth..."

# หยุด containers
echo "⏹️  หยุด containers..."
docker-compose down

# Rebuild และ start
echo "🔨  Rebuild และ start containers..."
docker-compose up --build -d

# รอให้ containers เริ่มทำงาน
echo "⏳ รอให้ containers เริ่มทำงาน..."
sleep 15

# ตรวจสอบสถานะ
echo "📊 ตรวจสอบสถานะ containers..."
docker-compose ps

# ทดสอบการเชื่อมต่อ
echo "🧪 ทดสอบการเชื่อมต่อ..."
chmod +x test-line-oauth.sh
./test-line-oauth.sh

# แสดง logs
echo "📋 แสดง logs ล่าสุด..."
docker-compose logs frontend --tail=30

echo "✅ เสร็จสิ้น!"
echo "🌐 เข้าถึงเว็บไซต์ได้ที่: https://thaihand.shop"
echo "🔍 หากยังมีปัญหา ให้ตรวจสอบ:"
echo "   1. LINE Developer Console - Callback URL"
echo "   2. Network connectivity"
echo "   3. Environment variables" 