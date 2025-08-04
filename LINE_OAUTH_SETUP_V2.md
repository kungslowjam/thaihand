# LINE OAuth Setup Guide (v2.1)

## 📚 อ้างอิง
- [LINE Developers Documentation](https://developers.line.biz/en/docs/line-login/integrate-line-login/#authentication-process)
- [LINE Developers Console](https://developers.line.biz/console/)

## 🎯 การตั้งค่า LINE OAuth v2.1

### 1. สร้าง LINE Login Channel

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. คลิก "Create Channel"
3. เลือก "LINE Login"
4. กรอกข้อมูล:
   - **Channel name**: `ThaiHand Login`
   - **Channel description**: `LINE Login for ThaiHand platform`
   - **Category**: `Shopping`
   - **Subcategory**: `Other`

### 2. ตั้งค่า Callback URL

ในหน้า Channel Settings > LINE Login:

```
https://thaihand.shop/api/auth/callback/line
```

### 3. สมัคร Email Permission

**สำคัญ**: เพื่อให้ได้ email address ต้องสมัคร permission

1. ไปที่ **Basic settings** tab
2. ใต้ **OpenID Connect** คลิก **Apply**
3. อ่านและยอมรับเงื่อนไข
4. อัปโหลด screenshot ที่อธิบายการเก็บ email
5. รอการอนุมัติ

### 4. Authorization URL Format

ตาม [LINE Developers Documentation](https://developers.line.biz/en/docs/line-login/integrate-line-login/#authentication-process):

```
https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=2007700233&redirect_uri=https%3A%2F%2Fthaihand.shop%2Fapi%2Fauth%2Fcallback%2Fline&state=12345abcde&scope=profile%20openid%20email&bot_prompt=normal
```

### 5. Parameters ที่จำเป็น

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| response_type | String | Required | `code` |
| client_id | String | Required | LINE Login Channel ID |
| redirect_uri | String | Required | Callback URL ที่ลงทะเบียน |
| state | String | Required | Random string สำหรับ CSRF protection |
| scope | String | Required | `profile openid email` |
| bot_prompt | String | Optional | `normal` |

### 6. NextAuth.js Configuration

```typescript
LineProvider({
  clientId: process.env.LINE_CLIENT_ID!,
  clientSecret: process.env.LINE_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: 'profile openid email',
      response_type: 'code',
      bot_prompt: 'normal',
    },
  },
})
```

### 7. Environment Variables

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

### ตรวจสอบ Authorization URL
URL ที่ถูกต้องควรเป็น:
```
https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=2007700233&redirect_uri=https%3A%2F%2Fthaihand.shop%2Fapi%2Fauth%2Fcallback%2Fline&state=...&scope=profile%20openid%20email&bot_prompt=normal
```

### ตรวจสอบ Console Logs
```bash
docker-compose logs frontend --tail=50
```

### ตรวจสอบ Network Requests
1. เปิด Browser Developer Tools
2. ไปที่ Network tab
3. คลิก LINE login button
4. ดู requests ที่เกิดขึ้น

## ⚠️ ปัญหาที่พบบ่อย

### "400 Bad Request"
- ตรวจสอบ Callback URL ใน LINE Developers Console
- ตรวจสอบ Client ID และ Client Secret
- ตรวจสอบ Scope settings
- ตรวจสอบ Email permission

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
- [ ] สมัคร Email address permission
- [ ] ตั้งค่า Scope: `profile`, `openid`, `email`
- [ ] ตั้งค่า Bot Prompt: `normal`
- [ ] เก็บ Client ID และ Client Secret
- [ ] ตั้งค่า environment variables
- [ ] ตั้งค่า NextAuth.js provider
- [ ] ทดสอบใน development
- [ ] ทดสอบใน production 