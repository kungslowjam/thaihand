#!/bin/bash

echo "🔍 ตรวจสอบการตั้งค่า LINE OAuth"
echo "=================================="

echo ""
echo "📋 Environment Variables:"
echo "------------------------"
echo "NEXTAUTH_URL: ${NEXTAUTH_URL:-'ไม่พบ'}"
echo "LINE_CLIENT_ID: ${LINE_CLIENT_ID:-'ไม่พบ'}"
echo "LINE_CLIENT_SECRET: ${LINE_CLIENT_SECRET:-'ไม่พบ'}"

echo ""
echo "🐳 Docker Containers:"
echo "-------------------"
docker-compose ps

echo ""
echo "📝 Frontend Logs (ล่าสุด 10 บรรทัด):"
echo "-----------------------------------"
docker-compose logs frontend --tail=10

echo ""
echo "🌐 ตรวจสอบ URL Accessibility:"
echo "----------------------------"

# ตรวจสอบ frontend
echo "Frontend (https://thaihand.shop):"
curl -I https://thaihand.shop 2>/dev/null | head -1 || echo "❌ ไม่สามารถเข้าถึง frontend ได้"

# ตรวจสอบ LINE OAuth URL
echo ""
echo "LINE OAuth URL:"
curl -I "https://access.line.me/oauth2/v2.1/authorize" 2>/dev/null | head -1 || echo "❌ ไม่สามารถเข้าถึง LINE OAuth ได้"

echo ""
echo "📋 Checklist สำหรับ LINE Developers Console:"
echo "=========================================="
echo "✅ Callback URL: https://thaihand.shop/api/auth/callback/line"
echo "✅ Scope: profile, openid, email"
echo "✅ Bot Prompt: Normal"
echo "✅ Channel Status: Published หรือ Development"
echo "✅ Email Permission: สมัครแล้ว"
echo ""
echo "❌ ลบ Callback URLs ที่ผิด:"
echo "   - http://thaihand.shop/api/auth/callback/line"
echo "   - https://0.0.0.0:3000/api/auth/callback/line"
echo "   - http://localhost:3000/api/auth/callback/line"

echo ""
echo "🔄 วิธีแก้ไข:"
echo "============="
echo "1. ไปที่ LINE Developers Console"
echo "2. เลือก Login Channel"
echo "3. ไปที่ LINE Login settings"
echo "4. ตั้งค่า Callback URL: https://thaihand.shop/api/auth/callback/line"
echo "5. ตรวจสอบ Scope settings"
echo "6. สมัคร Email permission"
echo "7. Rebuild containers: docker-compose down && docker-compose up -d --build" 