#!/bin/bash

echo "🔄 กำลังแก้ไขปัญหา LINE OAuth Authentication..."

# หยุด containers
echo "⏹️  หยุด containers..."
docker-compose down

# ลบ images เพื่อ rebuild
echo "🗑️  ลบ frontend image..."
docker rmi thaihand-frontend 2>/dev/null || true

# Rebuild และ start containers
echo "🔨  Rebuild และ start containers..."
docker-compose up --build -d

# รอให้ containers เริ่มทำงาน
echo "⏳ รอให้ containers เริ่มทำงาน..."
sleep 15

# ตรวจสอบสถานะ
echo "📊 ตรวจสอบสถานะ containers..."
docker-compose ps

# แสดง logs ของ frontend
echo "📋 แสดง logs ของ frontend..."
docker-compose logs frontend --tail=20

echo "✅ เสร็จสิ้น! กรุณาตรวจสอบ logs ด้านบนเพื่อดูว่าปัญหาได้รับการแก้ไขหรือไม่"
echo "🌐 เข้าถึงเว็บไซต์ได้ที่: https://thaihand.shop" 