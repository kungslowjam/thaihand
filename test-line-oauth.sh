#!/bin/bash

echo "🧪 ทดสอบ LINE OAuth Authentication..."

# ตรวจสอบ environment variables
echo "🔍 ตรวจสอบ environment variables..."
docker-compose exec frontend env | grep -E "LINE_|NEXTAUTH_"

# ตรวจสอบการเชื่อมต่อ LINE
echo "🌐 ตรวจสอบการเชื่อมต่อ LINE..."
docker-compose exec frontend curl -I --connect-timeout 10 https://access.line.me
docker-compose exec frontend curl -I --connect-timeout 10 https://api.line.me

# ตรวจสอบ logs
echo "📋 แสดง logs ล่าสุด..."
docker-compose logs frontend --tail=20 | grep -i "line\|auth\|error"

# ตรวจสอบ NextAuth configuration
echo "⚙️  ตรวจสอบ NextAuth configuration..."
docker-compose exec frontend node -e "
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET');
console.log('LINE_CLIENT_ID:', process.env.LINE_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('LINE_CLIENT_SECRET:', process.env.LINE_CLIENT_SECRET ? 'SET' : 'NOT SET');
"

echo "✅ เสร็จสิ้นการทดสอบ!"
echo "🌐 เข้าถึงเว็บไซต์ได้ที่: https://thaihand.shop" 