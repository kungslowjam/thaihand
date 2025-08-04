#!/bin/bash

echo "🧪 ทดสอบ LINE OAuth"
echo "=================="

echo ""
echo "📋 Environment Variables ใน Container:"
echo "------------------------------------"
docker-compose exec frontend env | grep -E "(NEXTAUTH|LINE)" || echo "❌ ไม่พบ environment variables"

echo ""
echo "🌐 ตรวจสอบ NextAuth Endpoints:"
echo "----------------------------"

# ตรวจสอบ providers endpoint
echo "Providers endpoint:"
curl -s https://thaihand.shop/api/auth/providers | jq . 2>/dev/null || echo "❌ ไม่สามารถเข้าถึง providers endpoint"

echo ""
echo "📝 Frontend Logs (ล่าสุด 5 บรรทัด):"
echo "----------------------------------"
docker-compose logs frontend --tail=5

echo ""
echo "🔍 ตรวจสอบ LINE OAuth URL:"
echo "-------------------------"
echo "URL ที่ควรเป็น:"
echo "https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=2007700233&redirect_uri=https://thaihand.shop/api/auth/callback/line&state=...&scope=profile%20openid%20email&bot_prompt=normal"

echo ""
echo "🔄 วิธีทดสอบ:"
echo "============="
echo "1. เปิด https://thaihand.shop/login"
echo "2. เปิด Browser Developer Tools (F12)"
echo "3. ไปที่ Network tab"
echo "4. คลิกปุ่ม 'เข้าสู่ระบบด้วย Line'"
echo "5. ดู requests ที่เกิดขึ้น"
echo "6. ควรเห็น redirect ไปที่ LINE authorization URL"

echo ""
echo "⚠️ ถ้าไม่ redirect:"
echo "================="
echo "1. ตรวจสอบ environment variables"
echo "2. ตรวจสอบ NextAuth configuration"
echo "3. ตรวจสอบ LINE Developers Console"
echo "4. Rebuild containers: docker-compose down && docker-compose up -d --build" 