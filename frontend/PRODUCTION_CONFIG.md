# Production Configuration

## Environment Variables สำหรับ Production

สร้างไฟล์ `.env.local` ใน frontend directory:

```env
# Production Environment
NODE_ENV=production

# NextAuth Configuration
NEXTAUTH_URL=https://thaihand.shop
NEXTAUTH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4

# OAuth Providers
GOOGLE_CLIENT_ID=570780773041-6h7v60llj41ml3pfvssjs45cadaa403t.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
LINE_CLIENT_ID=2007700233
LINE_CLIENT_SECRET=e035e453d938989b8277dfe7c885dad6

# API Configuration
NEXT_PUBLIC_API_URL=https://thaihand.shop/api
NEXT_PUBLIC_BACKEND_URL=https://thaihand.shop

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abhprxkswysntmerxklb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaHByeGtzd3lzbnRtZXJ4a2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTc2ODAsImV4cCI6MjA2NzAzMzY4MH0.MLRoT_AH5V9XrSFo7eDbqS8K76LTU69nxYUQqn9tIhk

# Production Settings
NEXTAUTH_DEBUG=false
```

## การ Build และ Deploy

### 1. Build Production
```bash
cd frontend
npm run build
```

### 2. Start Production Server
```bash
npm start
```

### 3. หรือใช้ PM2
```bash
npm install -g pm2
pm2 start npm --name "thaihand-frontend" -- start
```

## Production Optimizations

### 1. NextAuth Configuration
- ลด debug logs ใน production
- ใช้ production URLs
- เพิ่ม security headers

### 2. Performance
- เปิด compression
- ใช้ CDN สำหรับ static files
- Optimize images

### 3. Security
- ใช้ HTTPS เท่านั้น
- ตั้งค่า security headers
- ตรวจสอบ CORS settings

## LINE Console Settings สำหรับ Production

### Callback URLs
- **Production**: `https://thaihand.shop/api/auth/callback/line`
- **Development**: `http://localhost:3000/api/auth/callback/line`

### Channel Settings
1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก Channel ของคุณ
3. ไปที่ **LINE Login** tab
4. ตั้งค่า Callback URL: `https://thaihand.shop/api/auth/callback/line`
5. ตรวจสอบว่า Channel ถูก activate แล้ว

## การทดสอบ Production

### 1. ทดสอบ Line Login
1. ไปที่ `https://thaihand.shop/login`
2. คลิกปุ่ม "เข้าสู่ระบบด้วย Line"
3. ตรวจสอบว่า redirect ไป LINE OAuth
4. ตรวจสอบ callback กลับมาที่ dashboard

### 2. ตรวจสอบ SSL
- ตรวจสอบว่า HTTPS ทำงานถูกต้อง
- ตรวจสอบ SSL certificate

### 3. ตรวจสอบ Performance
- ใช้ Lighthouse audit
- ตรวจสอบ Core Web Vitals
- ตรวจสอบ loading time

## Monitoring และ Logs

### 1. Application Logs
```bash
# ดู logs
pm2 logs thaihand-frontend

# ดู status
pm2 status
```

### 2. Error Monitoring
- ตั้งค่า error tracking (Sentry, LogRocket)
- ตรวจสอบ console errors
- ตรวจสอบ network errors

### 3. Analytics
- ตั้งค่า Google Analytics
- ตรวจสอบ user behavior
- ตรวจสอบ conversion rates

## Backup และ Recovery

### 1. Database Backup
```bash
# PostgreSQL backup
pg_dump thaihand_db > backup.sql
```

### 2. Environment Variables Backup
- เก็บ environment variables ไว้ในที่ปลอดภัย
- ใช้ password manager
- ตั้งค่า backup strategy

## Troubleshooting

### ปัญหาที่พบบ่อยใน Production

1. **CORS Error**
   - ตรวจสอบ ALLOWED_ORIGINS
   - เพิ่ม domain ใน CORS settings

2. **SSL Certificate Issues**
   - ตรวจสอบ certificate expiration
   - ตรวจสอบ certificate chain

3. **Performance Issues**
   - ตรวจสอบ server resources
   - Optimize database queries
   - ใช้ caching

4. **Line Login Issues**
   - ตรวจสอบ Callback URL
   - ตรวจสอบ Channel status
   - ตรวจสอบ environment variables 