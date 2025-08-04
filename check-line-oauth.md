# ตรวจสอบ LINE OAuth Settings

## 1. ตรวจสอบ LINE Developers Console

ไปที่: https://developers.line.biz/

### Channel Settings > Basic settings
- **Channel ID**: `2007700233`
- **Channel Secret**: `b49b03b3902d44cf84d91b32aca5574e`

### Channel Settings > LINE Login
- **Callback URL**: `https://thaihand.shop/api/auth/callback/line`
- **Scope**: `profile`, `openid`, `email`
- **Bot Prompt**: `Normal`

## 2. ตรวจสอบ Environment Variables

```env
LINE_CLIENT_ID=2007700233
LINE_CLIENT_SECRET=b49b03b3902d44cf84d91b32aca5574e
NEXTAUTH_URL=https://thaihand.shop
```

## 3. ตรวจสอบ OAuth Flow

1. **User clicks LINE login button**
2. **Redirect to**: `https://access.line.me/oauth2/v2.1/authorize`
3. **User authorizes on LINE**
4. **Callback to**: `https://thaihand.shop/api/auth/callback/line`
5. **Process by NextAuth**: `https://thaihand.shop/api/auth/callback/line`
6. **Redirect to**: `https://thaihand.shop/dashboard`

## 4. Debug Steps

### ตรวจสอบ Console Logs
```bash
docker-compose logs frontend --tail=50
```

### ตรวจสอบ Network Requests
1. เปิด Browser Developer Tools
2. ไปที่ Network tab
3. คลิก LINE login button
4. ดู requests ที่เกิดขึ้น

### ตรวจสอบ LINE OAuth URL
URL ที่ถูกต้องควรเป็น:
```
https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=2007700233&redirect_uri=https://thaihand.shop/api/auth/callback/line&state=...&scope=profile%20openid%20email&bot_prompt=normal
```

## 5. ปัญหาที่พบบ่อย

### "เกิดข้อผิดพลาดในการเริ่มต้น OAuth"
- ตรวจสอบ Callback URL ใน LINE Developers Console
- ตรวจสอบ Client ID และ Client Secret
- ตรวจสอบ Scope settings

### "ไม่ได้รับ authorization code"
- ตรวจสอบ Bot Prompt settings
- ตรวจสอบ Scope permissions
- ตรวจสอบ Channel status

### Redirect Loop
- ตรวจสอบ Callback URL ให้ตรงกัน
- ตรวจสอบ NextAuth configuration
- ตรวจสอบ environment variables

## 6. การทดสอบ

### ทดสอบใน Production
1. ไปที่: `https://thaihand.shop/login`
2. คลิกปุ่ม "เข้าสู่ระบบด้วย Line"
3. ตรวจสอบ console logs
4. ตรวจสอบ network requests

### ทดสอบใน Development
1. ไปที่: `http://localhost:3000/login`
2. คลิกปุ่ม "เข้าสู่ระบบด้วย Line"
3. ตรวจสอบ console logs
4. ตรวจสอบ network requests 