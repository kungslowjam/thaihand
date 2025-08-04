# LINE OAuth Setup Guide

## การตั้งค่า LINE OAuth ใน LINE Developers Console

### 1. เข้าไปที่ LINE Developers Console
- ไปที่: https://developers.line.biz/
- เข้าสู่ระบบด้วย LINE account

### 2. สร้าง Channel ใหม่
1. คลิก "Create Channel"
2. เลือก "LINE Login"
3. กรอกข้อมูล:
   - Channel name: `ThaiHand Login`
   - Channel description: `LINE Login for ThaiHand platform`
   - Category: `Shopping`
   - Subcategory: `Other`

### 3. ตั้งค่า Callback URL
ในหน้า Channel Settings > LINE Login:

**Callback URL:**
```
https://thaihand.shop/api/auth/callback/line
```

**สำหรับ Development:**
```
http://localhost:3000/api/auth/callback/line
```

### 4. ตั้งค่า Scope
เลือก scopes ที่ต้องการ:
- ✅ `profile` - ข้อมูลโปรไฟล์
- ✅ `openid` - OpenID Connect
- ✅ `email` - อีเมล (ถ้ามี)

### 5. ตั้งค่า Bot Prompt
- เลือก "Normal" (ไม่บังคับให้เพิ่ม bot เป็นเพื่อน)

### 6. เก็บข้อมูล Credentials
จากหน้า Channel Settings > Basic settings:

**Channel ID (Client ID):**
```
2007700233
```

**Channel Secret (Client Secret):**
```
b49b03b3902d44cf84d91b32aca5574e
```

### 7. ตั้งค่า Environment Variables

**Production (.env):**
```env
LINE_CLIENT_ID=2007700233
LINE_CLIENT_SECRET=b49b03b3902d44cf84d91b32aca5574e
NEXTAUTH_URL=https://thaihand.shop
```

**Development (.env.local):**
```env
LINE_CLIENT_ID=2007700233
LINE_CLIENT_SECRET=b49b03b3902d44cf84d91b32aca5574e
NEXTAUTH_URL=http://localhost:3000
```

## การทดสอบ

### 1. ทดสอบใน Development
```bash
# รัน development server
npm run dev

# ไปที่ http://localhost:3000/login
# คลิกปุ่ม "เข้าสู่ระบบด้วย Line"
```

### 2. ทดสอบใน Production
```bash
# รัน production server
docker-compose up

# ไปที่ https://thaihand.shop/login
# คลิกปุ่ม "เข้าสู่ระบบด้วย Line"
```

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย:

1. **"เกิดข้อผิดพลาดในการเข้าสู่ระบบ"**
   - ตรวจสอบ Callback URL ใน LINE Developers Console
   - ตรวจสอบ Client ID และ Client Secret
   - ตรวจสอบ NEXTAUTH_URL ใน environment variables

2. **"ไม่ได้รับ authorization code"**
   - ตรวจสอบ Scope settings
   - ตรวจสอบ Bot Prompt settings

3. **Redirect loop**
   - ตรวจสอบ redirect callback ใน NextAuth configuration
   - ตรวจสอบ base URL settings

### Debug Steps:

1. เปิด Browser Developer Tools
2. ดู Console logs
3. ตรวจสอบ Network tab สำหรับ OAuth requests
4. ตรวจสอบ Application tab สำหรับ cookies และ storage

## Security Notes

- อย่าเปิดเผย Client Secret ใน public repositories
- ใช้ environment variables เสมอ
- ตรวจสอบ Callback URL ให้ตรงกับ domain ที่ใช้จริง
- เปิด HTTPS ใน production 