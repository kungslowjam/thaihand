#!/bin/bash

echo "🔧 แก้ไขปัญหา LINE OAuth..."
echo "=========================="

# หยุด containers
echo "🛑 หยุด containers..."
docker-compose down

# ลบ frontend image
echo "🗑️ ลบ frontend image..."
docker rmi thaihand-frontend 2>/dev/null || true

# ล้าง cache
echo "🧹 ล้าง cache..."
docker system prune -f

# ตรวจสอบ .env file
echo "📋 ตรวจสอบ .env file..."
if [ ! -f .env ]; then
    echo "❌ ไม่พบไฟล์ .env"
    echo "📝 สร้างไฟล์ .env ใหม่..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://thaihand_user:thaihand_password@postgres:5432/thaihand_db

# Security
SECRET_KEY=your-secret-key-here-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=False

# CORS Configuration
ALLOWED_ORIGINS=https://thaihand.shop,https://www.thaihand.shop,http://localhost:3000

# NextAuth Configuration
NEXTAUTH_URL=https://thaihand.shop
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# LINE OAuth - ต้องตั้งค่าใน LINE Developer Console
LINE_CLIENT_ID=your-line-client-id
LINE_CLIENT_SECRET=your-line-client-secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abhprxkswysntmerxklb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaHByeGtzd3lzbnRtZXJ4a2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTc2ODAsImV4cCI6MjA2NzAzMzY4MH0.MLRoT_AH5V9XrSFo7eDbqS8K76LTU69nxYUQqn9tIhk

# API URLs
NEXT_PUBLIC_API_URL=https://thaihand.shop/api
NEXT_PUBLIC_BACKEND_URL=https://thaihand.shop
EOF
    echo "✅ สร้างไฟล์ .env เรียบร้อย"
    echo "⚠️  กรุณาแก้ไข LINE_CLIENT_ID และ LINE_CLIENT_SECRET ในไฟล์ .env"
else
    echo "✅ พบไฟล์ .env แล้ว"
fi

# Rebuild และ start
echo "🔨 Rebuild และ start containers..."
docker-compose up --build -d

# รอให้ containers เริ่มต้น
echo "⏳ รอให้ containers เริ่มต้น..."
sleep 10

# ตรวจสอบ logs
echo "📊 ตรวจสอบ logs..."
docker-compose logs frontend --tail=20

echo ""
echo "✅ เสร็จสิ้น! ตรวจสอบ logs ด้านบนเพื่อดูข้อผิดพลาด"
echo ""
echo "📝 ข้อแนะนำเพิ่มเติม:"
echo "1. ตรวจสอบ LINE Developer Console ว่าการตั้งค่า OAuth ถูกต้อง"
echo "2. ตรวจสอบ Callback URL: https://thaihand.shop/api/auth/callback/line"
echo "3. ตรวจสอบ LINE_CLIENT_ID และ LINE_CLIENT_SECRET ใน .env"
echo "4. รัน ./check-line-oauth.sh เพื่อตรวจสอบการเชื่อมต่อ" 