#!/bin/bash

echo "🧪 Testing LINE OAuth Configuration..."

# Check environment variables
echo "📋 Environment Variables:"
echo "LINE_CLIENT_ID: ${LINE_CLIENT_ID:-'NOT SET'}"
echo "LINE_CLIENT_SECRET: ${LINE_CLIENT_SECRET:0:8}..."
echo "NEXTAUTH_URL: ${NEXTAUTH_URL:-'NOT SET'}"

# Check containers
echo ""
echo "🐳 Container Status:"
docker-compose ps

# Check frontend logs
echo ""
echo "📋 Frontend Logs (last 20 lines):"
docker-compose logs frontend --tail=20

# Test LINE OAuth URL
echo ""
echo "🔗 Testing LINE OAuth URL:"
LINE_OAUTH_URL="https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=2007700233&redirect_uri=https://thaihand.shop/api/auth/callback/line&scope=profile%20openid%20email&bot_prompt=normal"
echo "LINE OAuth URL: $LINE_OAUTH_URL"

# Test callback URL
echo ""
echo "🔄 Testing Callback URL:"
CALLBACK_URL="https://thaihand.shop/api/auth/callback/line"
echo "Callback URL: $CALLBACK_URL"

# Check if callback URL is accessible
echo ""
echo "🌐 Testing Callback URL Accessibility:"
if curl -f "$CALLBACK_URL" > /dev/null 2>&1; then
    echo "✅ Callback URL is accessible"
else
    echo "❌ Callback URL is not accessible"
fi

# Check if main site is accessible
echo ""
echo "🌐 Testing Main Site:"
if curl -f "https://thaihand.shop" > /dev/null 2>&1; then
    echo "✅ Main site is accessible"
else
    echo "❌ Main site is not accessible"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. ไปที่: https://thaihand.shop/login"
echo "2. คลิกปุ่ม 'เข้าสู่ระบบด้วย Line'"
echo "3. ตรวจสอบ console logs ใน browser"
echo "4. ตรวจสอบ network requests" 