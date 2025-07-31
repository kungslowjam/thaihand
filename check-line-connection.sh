#!/bin/bash

echo "🔍 ตรวจสอบการเชื่อมต่อกับ LINE API..."

# ตรวจสอบ DNS resolution
echo "📡 ตรวจสอบ DNS resolution..."
docker-compose exec frontend nslookup access.line.me
docker-compose exec frontend nslookup api.line.me

# ตรวจสอบ ping
echo "🏓 ตรวจสอบ ping..."
docker-compose exec frontend ping -c 3 access.line.me
docker-compose exec frontend ping -c 3 api.line.me

# ตรวจสอบ HTTP connectivity
echo "🌐 ตรวจสอบ HTTP connectivity..."
docker-compose exec frontend curl -I --connect-timeout 10 https://access.line.me
docker-compose exec frontend curl -I --connect-timeout 10 https://api.line.me

# ตรวจสอบ environment variables
echo "🔧 ตรวจสอบ environment variables..."
docker-compose exec frontend env | grep -E "LINE_|NEXTAUTH_"

# ตรวจสอบ logs
echo "📋 แสดง logs ล่าสุด..."
docker-compose logs frontend --tail=20 | grep -i "line\|auth\|error"

echo "✅ เสร็จสิ้นการตรวจสอบ!" 