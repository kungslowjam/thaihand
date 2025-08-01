#!/bin/bash

echo "🔧 แก้ไขปัญหา LINE OAuth แบบเรียบง่าย..."

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
sleep 30

# ตรวจสอบ logs
echo "📋 ตรวจสอบ logs..."
docker-compose logs frontend --tail=20

echo "✅ เสร็จสิ้น!"
echo ""
echo "🌐 ทดสอบ: https://thaihand.shop/login" 