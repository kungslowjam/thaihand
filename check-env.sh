#!/bin/bash

echo "🔍 ตรวจสอบ Environment Variables..."

# ตรวจสอบไฟล์ .env
if [ -f .env ]; then
    echo "✅ ไฟล์ .env พบ"
    echo "📋 LINE OAuth Configuration:"
    grep -E "LINE_|NEXTAUTH_" .env
else
    echo "❌ ไม่พบไฟล์ .env"
    exit 1
fi

# ตรวจสอบใน container
echo ""
echo "🐳 ตรวจสอบใน Frontend Container:"
docker-compose exec frontend env | grep -E "LINE_|NEXTAUTH_"

echo ""
echo "✅ เสร็จสิ้นการตรวจสอบ!" 