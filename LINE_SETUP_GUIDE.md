# LINE OAuth Setup Guide (NextAuth.js v4)

## 📚 อ้างอิง
- [NextAuth.js LINE Provider Documentation](https://next-auth.js.org/providers/line)
- [LINE Developers Documentation](https://developers.line.biz/en/docs/line-login/integrate-line-login/)
- [LINE Developers Console](https://developers.line.biz/console/)

## 🎯 การตั้งค่า LINE OAuth

### 1. สร้าง LINE Login Channel

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. คลิก "Create Channel"
3. เลือก "LINE Login"
4. กรอกข้อมูล:
   - **Channel name**: `ThaiHand Login`
   - **Channel description**: `LINE Login for ThaiHand platform`
   - **Category**: `Shopping`
   - **Subcategory**: `Other`

### 2. ตั้งค่า LINE Login

ในหน้า Channel Settings > LINE Login:

#### ✅ Callback URL
```
https://thaihand.shop/api/auth/callback/line
```

#### ✅ Scope Settings
- ✅ `profile` - ข้อมูลโปรไฟล์
- ✅ `openid` - OpenID Connect
- ✅ `email` - อีเมล (ต้องสมัคร permission)

#### ✅ Bot Prompt
- เลือก "Normal" (ไม่บังคับให้เพิ่ม bot เป็นเพื่อน)

### 3. สมัคร Email Permission

**สำคัญ**: เพื่อให้ได้ email address ต้องสมัคร permission

1. ไปที่ LINE Developer Console
2. เลือก Login Channel ของคุณ
3. เลื่อนลงไปที่ **OpenID Connect**
4. คลิก **Email address permission**
5. คลิก **Apply** และทำตามคำแนะนำ

### 4. เก็บข้อมูล Credentials

จากหน้า Channel Settings > Basic settings:

```env
LINE_CLIENT_ID=2007700233
LINE_CLIENT_SECRET=b49b03b3902d44cf84d91b32aca5574e
```

### 5. ตั้งค่า NextAuth.js

ตาม [NextAuth.js documentation](https://next-auth.js.org/providers/line):

```typescript
import LineProvider from "next-auth/providers/line";

providers: [
  LineProvider({
    clientId: process.env.LINE_CLIENT_ID,
    clientSecret: process.env.LINE_CLIENT_SECRET
  })
]
```

### 6. Environment Variables

```env
# LINE OAuth
LINE_CLIENT_ID=2007700233
LINE_CLIENT_SECRET=b49b03b3902d44cf84d91b32aca5574e

# NextAuth
NEXTAUTH_URL=https://thaihand.shop
NEXTAUTH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4
```

## 🔄 OAuth Flow

1. **User clicks LINE login button**
2. **Redirect to**: `https://access.line.me/oauth2/v2.1/authorize`
3. **User authorizes on LINE**
4. **Callback to**: `https://thaihand.shop/api/auth/callback/line`
5. **Process by NextAuth**: `https://thaihand.shop/api/auth/callback/line`
6. **Redirect to**: `https://thaihand.shop/dashboard`

## 🧪 การทดสอบ

### Development
```bash
# รัน development server
npm run dev

# ไปที่ http://localhost:3000/login
# คลิกปุ่ม "เข้าสู่ระบบด้วย Line"
```

### Production
```bash
# รัน production server
docker-compose up -d

# ไปที่ https://thaihand.shop/login
# คลิกปุ่ม "เข้าสู่ระบบด้วย Line"
```

## 🔍 Debug Steps

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

## ⚠️ ปัญหาที่พบบ่อย

### "เกิดข้อผิดพลาดในการเริ่มต้น OAuth"
- ตรวจสอบ Callback URL ใน LINE Developers Console
- ตรวจสอบ Client ID และ Client Secret
- ตรวจสอบ Scope settings

### "ไม่ได้รับ authorization code"
- ตรวจสอบ Bot Prompt settings
- ตรวจสอบ Scope permissions
- ตรวจสอบ Channel status

### "ไม่ได้รับ email"
- ตรวจสอบ Email permission ใน LINE Developers Console
- ต้องสมัคร Email address permission

### Redirect Loop
- ตรวจสอบ Callback URL ให้ตรงกัน
- ตรวจสอบ NextAuth configuration
- ตรวจสอบ environment variables

## 📋 Checklist

- [ ] สร้าง LINE Login Channel
- [ ] ตั้งค่า Callback URL: `https://thaihand.shop/api/auth/callback/line`
- [ ] ตั้งค่า Scope: `profile`, `openid`, `email`
- [ ] สมัคร Email address permission
- [ ] เก็บ Client ID และ Client Secret
- [ ] ตั้งค่า environment variables
- [ ] ตั้งค่า NextAuth.js provider
- [ ] ทดสอบใน development
- [ ] ทดสอบใน production 