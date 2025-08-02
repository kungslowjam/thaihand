# LINE OAuth Troubleshooting Guide

## ภาพรวม

คู่มือนี้จะช่วยคุณแก้ไขปัญหาที่พบบ่อยในการใช้งาน LINE OAuth

## การตรวจสอบเบื้องต้น

### 1. ตรวจสอบ Environment Variables

```bash
# ตรวจสอบ environment variables
docker-compose exec frontend env | grep LINE
docker-compose exec frontend env | grep NEXTAUTH
```

**ค่าที่ควรได้:**
```env
LINE_CLIENT_ID=your-line-channel-id
LINE_CLIENT_SECRET=your-line-channel-secret
NEXT_PUBLIC_LINE_CLIENT_ID=your-line-channel-id
NEXTAUTH_URL=https://thaihand.shop
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_DEBUG=true
NEXTAUTH_LOGGING=true
```

### 2. ตรวจสอบ Container Status

```bash
# ตรวจสอบสถานะ containers
docker-compose ps

# ตรวจสอบ logs
docker-compose logs frontend
```

### 3. ตรวจสอบ Network Connectivity

```bash
# ทดสอบการเชื่อมต่อกับ LINE API
curl -I https://access.line.me/oauth2/v2.1/authorize

# ทดสอบ DNS resolution
nslookup access.line.me
```

## ปัญหาที่พบบ่อย

### 🔴 Error: invalid_client

**อาการ**: ได้ error "invalid_client" จาก LINE OAuth

**สาเหตุที่เป็นไปได้:**
1. LINE_CLIENT_ID ไม่ถูกต้อง
2. LINE_CLIENT_SECRET ไม่ถูกต้อง
3. Channel ยังไม่ได้เปิดใช้งาน

**วิธีแก้ไข:**

#### 1. ตรวจสอบ LINE Developers Console
```bash
# ไปที่ https://developers.line.biz/console/
# ตรวจสอบ Channel ID และ Channel Secret
```

#### 2. ตรวจสอบ Environment Variables
```bash
# ตรวจสอบว่า environment variables ถูกต้อง
docker-compose exec frontend env | grep LINE_CLIENT
```

#### 3. รีสตาร์ท Containers
```bash
# รีสตาร์ท frontend container
docker-compose restart frontend

# หรือรีสตาร์ททั้งหมด
docker-compose down && docker-compose up -d
```

### 🔴 Error: invalid_redirect_uri

**อาการ**: ได้ error "invalid_redirect_uri" จาก LINE OAuth

**สาเหตุที่เป็นไปได้:**
1. Callback URL ไม่ตรงกับที่ตั้งไว้ใน LINE Developers Console
2. Callback URL ไม่ใช่ HTTPS

**วิธีแก้ไข:**

#### 1. ตรวจสอบ Callback URL ใน LINE Developers Console
- ไปที่ LINE Developers Console
- ตรวจสอบ Callback URL ต้องเป็น: `https://thaihand.shop/api/auth/callback/line`
- ไม่มี trailing slash

#### 2. ตรวจสอบ NextAuth Configuration
```typescript
// ตรวจสอบไฟล์ frontend/app/api/auth/[...nextauth]/route.ts
LineProvider({
  clientId: process.env.LINE_CLIENT_ID!,
  clientSecret: process.env.LINE_CLIENT_SECRET!,
  // ตรวจสอบ authorization URL
})
```

### 🔴 Error: invalid_scope

**อาการ**: ได้ error "invalid_scope" จาก LINE OAuth

**สาเหตุที่เป็นไปได้:**
1. Scope ไม่ถูกต้อง
2. Channel ไม่รองรับ scope ที่ขอ

**วิธีแก้ไข:**

#### 1. ตรวจสอบ Scope ใน LINE Developers Console
- ไปที่ LINE Developers Console
- ตรวจสอบ Scope ต้องเป็น: `profile openid`

#### 2. ตรวจสอบ NextAuth Configuration
```typescript
// ตรวจสอบไฟล์ frontend/app/api/auth/[...nextauth]/route.ts
authorization: {
  params: {
    scope: "profile openid", // ต้องตรงกับที่ตั้งไว้
  }
}
```

### 🔴 Error: access_denied

**อาการ**: ได้ error "access_denied" จาก LINE OAuth

**สาเหตุที่เป็นไปได้:**
1. ผู้ใช้ปฏิเสธการเข้าสู่ระบบ
2. การตั้งค่า Channel ไม่ถูกต้อง

**วิธีแก้ไข:**

#### 1. ตรวจสอบ Channel Settings
- ไปที่ LINE Developers Console
- ตรวจสอบ Bot link option ต้องปิด
- ตรวจสอบ Add friends ต้องปิด

#### 2. ทดสอบการเข้าสู่ระบบใหม่
- ลองเข้าสู่ระบบใหม่อีกครั้ง
- ตรวจสอบว่าไม่มีการ block LINE OAuth

### 🔴 Error: server_error

**อาการ**: ได้ error "server_error" จาก LINE OAuth

**สาเหตุที่เป็นไปได้:**
1. LINE API มีปัญหา
2. Network connectivity มีปัญหา

**วิธีแก้ไข:**

#### 1. ตรวจสอบ LINE API Status
```bash
# ทดสอบ LINE API
curl -I https://access.line.me/oauth2/v2.1/authorize
curl -I https://api.line.me/v2/profile
```

#### 2. ตรวจสอบ Network
```bash
# ทดสอบ DNS
nslookup access.line.me
nslookup api.line.me

# ทดสอบ connectivity
ping access.line.me
```

### 🔴 Error: timeout

**อาการ**: การเชื่อมต่อใช้เวลานานเกินไป

**สาเหตุที่เป็นไปได้:**
1. Network connectivity ช้า
2. LINE API response ช้า
3. Container resources ไม่เพียงพอ

**วิธีแก้ไข:**

#### 1. ตรวจสอบ Network
```bash
# ทดสอบ network speed
curl -w "@-" -o /dev/null -s "https://access.line.me/oauth2/v2.1/authorize"
```

#### 2. ตรวจสอบ Container Resources
```bash
# ตรวจสอบ memory และ CPU usage
docker stats
```

#### 3. เพิ่ม Timeout Settings
```env
# เพิ่มใน docker-compose.yml
NODE_OPTIONS=--max-http-header-size=8192 --max-old-space-size=4096
```

## การ Debug

### เปิด Debug Mode

```env
# เพิ่มใน .env
NEXTAUTH_DEBUG=true
NEXTAUTH_LOGGING=true
```

### ตรวจสอบ Logs

```bash
# ดู logs แบบ real-time
docker-compose logs -f frontend

# ดู logs เฉพาะ NextAuth
docker-compose logs frontend | grep -i "nextauth"

# ดู logs เฉพาะ LINE
docker-compose logs frontend | grep -i "line"
```

### ตรวจสอบ Network Requests

```bash
# ใช้ browser developer tools
# ไปที่ Network tab
# ตรวจสอบ requests ไปยัง LINE API
```

## การทดสอบ

### 1. ทดสอบ Callback URL

```bash
# ทดสอบ Callback URL
curl -I "https://thaihand.shop/api/auth/callback/line"
# ควรได้ 404 (ปกติสำหรับ callback URL)
```

### 2. ทดสอบ LINE API

```bash
# ทดสอบ LINE Authorization URL
curl -I "https://access.line.me/oauth2/v2.1/authorize"
# ควรได้ 200 OK
```

### 3. ทดสอบการเข้าสู่ระบบ

1. ไปที่ `https://thaihand.shop/login`
2. คลิกปุ่ม "เข้าสู่ระบบด้วย LINE"
3. ตรวจสอบ logs
4. ตรวจสอบ network requests

## การแก้ไขปัญหาเฉพาะ

### ปัญหา: Container ไม่สามารถเชื่อมต่อกับ LINE API

**วิธีแก้ไข:**

#### 1. ตรวจสอบ DNS
```bash
# เพิ่ม DNS servers ใน docker-compose.yml
dns:
  - 8.8.8.8
  - 8.8.4.4
  - 1.1.1.1
```

#### 2. ตรวจสอบ Firewall
```bash
# ตรวจสอบว่า port 443 เปิด
telnet access.line.me 443
```

#### 3. ใช้ Proxy (ถ้าจำเป็น)
```env
# เพิ่มใน environment
HTTP_PROXY=http://proxy:port
HTTPS_PROXY=http://proxy:port
```

### ปัญหา: Callback ไม่ทำงาน

**วิธีแก้ไข:**

#### 1. ตรวจสอบ Callback Handler
```typescript
// ตรวจสอบไฟล์ frontend/app/api/auth/callback/line/route.ts
// ตรวจสอบว่า handler ทำงานถูกต้อง
```

#### 2. ตรวจสอบ Error Handler
```typescript
// ตรวจสอบไฟล์ frontend/app/api/auth/error/route.ts
// ตรวจสอบว่า error handling ทำงานถูกต้อง
```

### ปัญหา: Session ไม่ถูกเก็บ

**วิธีแก้ไข:**

#### 1. ตรวจสอบ NEXTAUTH_SECRET
```env
# ตรวจสอบว่า NEXTAUTH_SECRET ถูกต้อง
NEXTAUTH_SECRET=your-secret-key-here
```

#### 2. ตรวจสอบ Session Strategy
```typescript
// ตรวจสอบ NextAuth configuration
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 วัน
}
```

## การป้องกันปัญหา

### 1. ตรวจสอบเป็นประจำ

```bash
# สร้าง script สำหรับตรวจสอบ
#!/bin/bash
echo "Checking LINE OAuth status..."

# ตรวจสอบ containers
docker-compose ps

# ตรวจสอบ environment variables
docker-compose exec frontend env | grep LINE

# ตรวจสอบ network
curl -I https://access.line.me/oauth2/v2.1/authorize

echo "Check complete!"
```

### 2. Monitoring

```bash
# ตรวจสอบ logs เป็นประจำ
docker-compose logs --tail=100 frontend | grep -i "error"

# ตรวจสอบ error rates
docker-compose logs frontend | grep -c "error"
```

### 3. Backup Configuration

```bash
# สำรอง environment variables
docker-compose exec frontend env > backup.env

# สำรอง configuration files
cp frontend/app/api/auth/[...nextauth]/route.ts backup/
```

## การติดต่อ Support

### ข้อมูลที่ต้องเตรียม

1. **Error Message**: ข้อความ error ที่ได้รับ
2. **Logs**: Logs จาก container
3. **Environment Variables**: Environment variables ที่ใช้
4. **Steps to Reproduce**: ขั้นตอนการทำซ้ำปัญหา
5. **Browser Information**: Browser และ version ที่ใช้

### การส่งข้อมูล

```bash
# สร้าง diagnostic report
echo "=== LINE OAuth Diagnostic Report ===" > diagnostic.txt
echo "Date: $(date)" >> diagnostic.txt
echo "=== Environment Variables ===" >> diagnostic.txt
docker-compose exec frontend env | grep -E "(LINE|NEXTAUTH)" >> diagnostic.txt
echo "=== Container Status ===" >> diagnostic.txt
docker-compose ps >> diagnostic.txt
echo "=== Recent Logs ===" >> diagnostic.txt
docker-compose logs --tail=50 frontend >> diagnostic.txt
```

## สรุป

คู่มือนี้ครอบคลุมปัญหาที่พบบ่อยในการใช้งาน LINE OAuth หากยังมีปัญหา กรุณาติดต่อ support พร้อมข้อมูลที่ครบถ้วน 