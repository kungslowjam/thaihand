# แก้ไขปัญหา OAuth Error - Quick Fix

## ปัญหา
```
https://localhost:3000/login?error=OAuthSignin&message=เกิดข้อผิดพลาดในการเข้าสู่ระบบ
```

## สาเหตุ
- ใช้ `https://localhost:3000` แต่ development ควรใช้ `http://localhost:3000`
- ไม่มีไฟล์ `.env.local` สำหรับ development environment

## วิธีแก้ไข

### 1. สร้างไฟล์ `.env.local` ใน frontend directory

คัดลอกเนื้อหาจาก `env.local.template` ไปยัง `.env.local`:

```bash
cd frontend
cp env.local.template .env.local
```

หรือสร้างไฟล์ `.env.local` ใหม่ด้วยเนื้อหา:

```env
# Development Environment
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_DEBUG=true

# OAuth Providers
GOOGLE_CLIENT_ID=570780773041-6h7v60llj41ml3pfvssjs45cadaa403t.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
LINE_CLIENT_ID=2007700233
LINE_CLIENT_SECRET=b49b03b3902d44cf84d91b32aca5574e

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abhprxkswysntmerxklb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaHByeGtzd3lzbnRtZXJ4a2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTc2ODAsImV4cCI6MjA2NzAzMzY4MH0.MLRoT_AH5V9XrSFo7eDbqS8K76LTU69nxYUQqn9tIhk
```

### 2. รีสตาร์ท Development Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### 3. ทดสอบ Line Login

1. ไปที่ `http://localhost:3000/login`
2. คลิกปุ่ม "เข้าสู่ระบบด้วย Line"
3. ตรวจสอบ console logs

## ตรวจสอบการแก้ไข

### ✅ **Environment Variables**
```bash
# ตรวจสอบว่าไฟล์ .env.local ถูกโหลด
echo $NEXTAUTH_URL  # ควรเป็น http://localhost:3000
echo $NODE_ENV      # ควรเป็น development
```

### ✅ **LINE Console Settings**
- ✅ `http://localhost:3000/api/auth/callback/line` (Development)
- ✅ `https://thaihand.shop/api/auth/callback/line` (Production)

### ✅ **Expected Behavior**
1. Line login redirect ไปยัง LINE OAuth
2. หลังจาก authorize กลับมาที่ `http://localhost:3000/dashboard`
3. ไม่มี OAuth error

## Troubleshooting

### ถ้ายังมีปัญหา:

1. **Clear Browser Cache**
   ```bash
   # ลบ cache และ cookies
   # หรือใช้ incognito mode
   ```

2. **Check Environment Variables**
   ```bash
   # ตรวจสอบว่า .env.local ถูกโหลด
   npm run dev
   # ดู console logs
   ```

3. **Verify LINE Console**
   - ตรวจสอบ Callback URLs
   - ตรวจสอบ Channel status

## Production vs Development

| Environment | URL | Protocol | Callback URL |
|-------------|-----|----------|--------------|
| Development | `http://localhost:3000` | HTTP | `http://localhost:3000/api/auth/callback/line` |
| Production | `https://thaihand.shop` | HTTPS | `https://thaihand.shop/api/auth/callback/line` |

## Success Indicators

✅ **Line Login ทำงานได้**
- ไม่มี OAuth error
- Redirect ไปยัง LINE OAuth
- กลับมาที่ dashboard หลัง authorize

✅ **Console Logs**
- ไม่มี error messages
- เห็น debug logs (ถ้า NEXTAUTH_DEBUG=true)

✅ **Network Tab**
- เห็น OAuth requests
- ไม่มี failed requests 