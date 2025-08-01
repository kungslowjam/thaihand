#!/bin/bash

echo "🔍 ตรวจสอบ Environment Variables บน VPS..."

echo ""
echo "📋 Environment Variables ที่มีอยู่:"
echo "=================================="

# ตรวจสอบ environment variables หลัก
if [ -f .env ]; then
    echo "✅ ไฟล์ .env พบแล้ว"
    echo ""
    echo "📝 เนื้อหาไฟล์ .env:"
    echo "=================="
    cat .env | grep -E "(CLIENT|SECRET|URL)" | while read line; do
        if [[ $line == *"="* ]]; then
            key=$(echo $line | cut -d'=' -f1)
            value=$(echo $line | cut -d'=' -f2-)
            if [[ $key == *"SECRET"* ]] || [[ $key == *"CLIENT_SECRET"* ]]; then
                echo "$key=***HIDDEN***"
            else
                echo "$line"
            fi
        fi
    done
else
    echo "❌ ไฟล์ .env ไม่พบ"
fi

echo ""
echo "🐳 ตรวจสอบ Environment Variables ใน Docker Containers:"
echo "=================================================="

# ตรวจสอบ environment variables ใน frontend container
echo ""
echo "📱 Frontend Container Environment Variables:"
docker-compose exec frontend env | grep -E "(CLIENT|SECRET|URL)" | while read line; do
    if [[ $line == *"="* ]]; then
        key=$(echo $line | cut -d'=' -f1)
        value=$(echo $line | cut -d'=' -f2-)
        if [[ $key == *"SECRET"* ]] || [[ $key == *"CLIENT_SECRET"* ]]; then
            echo "$key=***HIDDEN***"
        else
            echo "$line"
        fi
    fi
done

echo ""
echo "🔧 Backend Container Environment Variables:"
docker-compose exec backend env | grep -E "(CLIENT|SECRET|URL)" | while read line; do
    if [[ $line == *"="* ]]; then
        key=$(echo $line | cut -d'=' -f1)
        value=$(echo $line | cut -d'=' -f2-)
        if [[ $key == *"SECRET"* ]] || [[ $key == *"CLIENT_SECRET"* ]]; then
            echo "$key=***HIDDEN***"
        else
            echo "$line"
        fi
    fi
done

echo ""
echo "📊 สถานะ Containers:"
echo "=================="
docker-compose ps

echo ""
echo "📋 Logs ล่าสุด:"
echo "============="
docker-compose logs --tail=10 frontend | grep -E "(ERROR|WARN|Missing|environment)" || echo "ไม่พบ error logs"

echo ""
echo "✅ การตรวจสอบเสร็จสิ้น!" 