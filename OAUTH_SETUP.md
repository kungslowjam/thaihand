# การตั้งค่า OAuth Authentication

## ภาพรวม
โปรเจคนี้รองรับการเข้าสู่ระบบผ่าน Google และ LINE OAuth โดยใช้ NextAuth.js

## การตั้งค่า Environment Variables

### 1. สร้างไฟล์ .env ใน root directory
```bash
# NextAuth Configuration
NEXTAUTH_URL=https://thaihand.shop
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# LINE OAuth
LINE_CLIENT_ID=your-line-client-id
LINE_CLIENT_SECRET=your-line-client-secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
NEXT_PUBLIC_API_URL=https://thaihand.shop/api
NEXT_PUBLIC_BACKEND_URL=https://thaihand.shop
```

## การตั้งค่า Google OAuth

### 1. สร้าง Google Cloud Project
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจคใหม่หรือเลือกโปรเจคที่มีอยู่
3. เปิดใช้งาน Google+ API

### 2. สร้าง OAuth 2.0 Credentials
1. ไปที่ "APIs & Services" > "Credentials"
2. คลิก "Create Credentials" > "OAuth 2.0 Client IDs"
3. เลือก "Web application"
4. ตั้งชื่อ: "ThaiHand OAuth"
5. เพิ่ม Authorized redirect URIs:
   - `https://thaihand.shop/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (สำหรับ development)

### 3. คัดลอก Client ID และ Client Secret
- คัดลอก Client ID ไปใส่ใน `GOOGLE_CLIENT_ID`
- คัดลอก Client Secret ไปใส่ใน `GOOGLE_CLIENT_SECRET`

## การตั้งค่า LINE OAuth

### 1. สร้าง LINE Login Channel
1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. สร้าง Provider ใหม่ (ถ้ายังไม่มี)
3. สร้าง Channel ใหม่ > เลือก "LINE Login"

### 2. ตั้งค่า Channel
1. ตั้งชื่อ Channel: "ThaiHand LINE Login"
2. ตั้งค่า Callback URL: `https://thaihand.shop/api/auth/callback/line`
3. เพิ่ม Scope: `profile`, `openid`, `email`

### 3. คัดลอก Channel ID และ Channel Secret
- คัดลอก Channel ID ไปใส่ใน `LINE_CLIENT_ID`
- คัดลอก Channel Secret ไปใส่ใน `LINE_CLIENT_SECRET`

## การทดสอบ

### 1. ตรวจสอบ Environment Variables
```bash
./check-env.sh
```

### 2. รันโปรเจค
```bash
docker-compose up --build -d
```

### 3. ทดสอบการเข้าสู่ระบบ
1. ไปที่ `https://thaihand.shop/login`
2. ทดสอบการเข้าสู่ระบบด้วย Google
3. ทดสอบการเข้าสู่ระบบด้วย LINE

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. OAuthSignin Error
- ตรวจสอบว่า environment variables ถูกตั้งค่าถูกต้อง
- ตรวจสอบว่า callback URLs ตรงกับที่ตั้งค่าใน OAuth providers

#### 2. LINE OAuth Timeout
- ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
- ตรวจสอบ DNS settings ใน docker-compose.yml
- ตรวจสอบ extra_hosts configuration

#### 3. Google OAuth Error
- ตรวจสอบว่า Google+ API เปิดใช้งาน
- ตรวจสอบว่า redirect URIs ถูกต้อง

### การตรวจสอบ Logs
```bash
# ตรวจสอบ frontend logs
docker-compose logs frontend --tail=50

# ตรวจสอบ backend logs
docker-compose logs backend --tail=50
```

## ความปลอดภัย

### 1. Environment Variables
- อย่า commit ไฟล์ .env ลงใน git
- ใช้ .env.example เป็นเทมเพลต
- เปลี่ยน secret keys ใน production

### 2. OAuth Configuration
- ใช้ HTTPS ใน production
- ตั้งค่า callback URLs ให้ถูกต้อง
- จำกัด scope ให้เหมาะสม

### 3. Session Management
- ตั้งค่า session maxAge ให้เหมาะสม
- ใช้ secure cookies ใน production
- ตรวจสอบ session validation

## การ Deploy

### 1. Production Environment
- ตั้งค่า `NEXTAUTH_URL` เป็น production URL
- ตั้งค่า `NEXTAUTH_SECRET` เป็น strong secret
- ตรวจสอบ SSL certificate

### 2. Docker Deployment
- ตรวจสอบ environment variables ใน docker-compose.yml
- ตรวจสอบ network configuration
- ตรวจสอบ volume mounts

## หมายเหตุ

- การตั้งค่า OAuth ต้องทำทั้งใน Google Cloud Console และ LINE Developers Console
- ตรวจสอบ callback URLs ให้ตรงกับ domain ที่ใช้งานจริง
- ใช้ HTTPS ใน production เพื่อความปลอดภัย
- ตรวจสอบ logs เมื่อมีปัญหา 