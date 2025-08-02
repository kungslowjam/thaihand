#!/bin/bash

echo "🔧 แก้ไขปัญหา OAuth Redirect..."

echo ""
echo "📋 ตรวจสอบ environment variables..."
docker-compose exec frontend env | grep -E "(NEXTAUTH|LINE|GOOGLE)" | while read line; do
    if [[ $line == *"="* ]]; then
        key=$(echo $line | cut -d'=' -f1)
        value=$(echo $line | cut -d'=' -f2-)
        if [[ $key == *"SECRET"* ]]; then
            echo "$key=***HIDDEN***"
        else
            echo "$line"
        fi
    fi
done

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