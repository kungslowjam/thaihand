#!/bin/bash

echo "🔍 ตรวจสอบ LINE OAuth Configuration..."
echo "=================================="

# ตรวจสอบ Environment Variables
echo "📋 ตรวจสอบ Environment Variables:"
echo "NEXTAUTH_URL: ${NEXTAUTH_URL:-ไม่พบ}"
echo "NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:+พบ}"
echo "LINE_CLIENT_ID: ${LINE_CLIENT_ID:+พบ}"
echo "LINE_CLIENT_SECRET: ${LINE_CLIENT_SECRET:+พบ}"

echo ""
echo "🌐 ตรวจสอบ Network Connectivity:"

# ตรวจสอบการเชื่อมต่อ LINE domains
echo "ping access.line.me..."
ping -c 3 access.line.me 2>/dev/null || echo "❌ ไม่สามารถเชื่อมต่อ access.line.me ได้"

echo "ping api.line.me..."
ping -c 3 api.line.me 2>/dev/null || echo "❌ ไม่สามารถเชื่อมต่อ api.line.me ได้"

echo ""
echo "🔗 ตรวจสอบ HTTP Connectivity:"
echo "curl https://access.line.me..."
curl -I https://access.line.me 2>/dev/null | head -1 || echo "❌ ไม่สามารถเชื่อมต่อ HTTPS ได้"

echo ""
echo "📝 ข้อแนะนำ:"
echo "1. ตรวจสอบ LINE_CLIENT_ID และ LINE_CLIENT_SECRET ใน .env"
echo "2. ตรวจสอบ Callback URL ใน LINE Developer Console: https://thaihand.shop/api/auth/callback/line"
echo "3. ตรวจสอบ NEXTAUTH_URL ว่าเป็น https://thaihand.shop"
echo "4. ตรวจสอบ NEXTAUTH_SECRET ว่าตั้งค่าแล้ว" 