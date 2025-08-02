# การแก้ไขปัญหา 400 Bad Request ใน LINE OAuth

## 🔍 ปัญหาที่เกิดขึ้น
```
[next-auth][error][SIGNIN_OAUTH_ERROR] 
https://next-auth.js.org/errors#signin_oauth_error expected 200 OK, got: 400 Bad Request
```

## ✅ การแก้ไขที่ได้ทำแล้ว

### 1. ลบ Authorization Parameters
```typescript
// เปลี่ยนจาก
LineProvider({
  clientId: process.env.LINE_CLIENT_ID!,
  clientSecret: process.env.LINE_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: 'profile openid',
      prompt: 'consent'
    }
  },
  httpOptions: {
    timeout: 30000,
  }
}),

// เป็น
LineProvider({
  clientId: process.env.LINE_CLIENT_ID!,
  clientSecret: process.env.LINE_CLIENT_SECRET!,
}),
```

## 🔧 การตรวจสอบการตั้งค่า

### 1. ตรวจสอบ LINE Developers Console
ไปที่ https://developers.line.biz/console/ และตรวจสอบ:

#### Channel Settings:
- **Channel ID:** `2007700233`
- **Channel Secret:** `e035e453d938989b8277dfe7c885dad6`
- **Channel Status:** เปิดใช้งาน

#### LINE Login Settings:
- **Callback URL:** `https://thaihand.shop/api/auth/callback/line`
- **Scope:** `profile openid`
- **Bot link option:** ปิด
- **Add friends:** ปิด

### 2. ตรวจสอบ Environment Variables
```bash
# ตรวจสอบ environment variables
docker-compose exec frontend env | grep LINE

# ผลลัพธ์ที่ควรได้:
# LINE_CLIENT_ID=2007700233
# LINE_CLIENT_SECRET=e035e453d938989b8277dfe7c885dad6
# NEXT_PUBLIC_LINE_CLIENT_ID=2007700233
```

### 3. ตรวจสอบ Callback URL
```bash
# ทดสอบ callback URL
curl -I "https://thaihand.shop/api/auth/callback/line"

# ควรได้ 200 OK หรือ 404 (ปกติสำหรับ callback URL)
```

## 🚀 การทดสอบ

### 1. รีสตาร์ทเซิร์ฟเวอร์
```bash
docker-compose down
docker-compose up -d
```

### 2. ตรวจสอบ logs
```bash
# ดู logs แบบ real-time
docker-compose logs -f frontend

# ดู error logs
docker-compose logs frontend | grep -i error

# ดู LINE specific logs
docker-compose logs frontend | grep -i line
```

### 3. ทดสอบการเข้าสู่ระบบ
1. ไปที่ `https://thaihand.shop/login`
2. คลิกปุ่ม "เข้าสู่ระบบด้วย LINE"
3. ตรวจสอบ logs เพื่อดูการทำงาน

## 🔍 การ Debug เพิ่มเติม

### หากยังมีปัญหา 400 Bad Request:

#### 1. ตรวจสอบ Channel Status
- ไปที่ LINE Developers Console
- ตรวจสอบว่า Channel เปิดใช้งานอยู่
- ตรวจสอบว่า Channel type เป็น "LINE Login"

#### 2. ตรวจสอบ Callback URL
- ตรวจสอบว่า Callback URL ตรงกับที่ตั้งไว้ใน LINE Developers Console
- ต้องเป็น: `https://thaihand.shop/api/auth/callback/line`

#### 3. ตรวจสอบ Scope
- ตรวจสอบว่า Scope ตั้งเป็น `profile openid`
- ไม่ต้องเพิ่ม `email` scope (ต้องขอสิทธิ์ก่อน)

#### 4. ตรวจสอบ Environment Variables
```bash
# ตรวจสอบใน container
docker-compose exec frontend env | grep LINE

# ตรวจสอบใน .env file
cat .env | grep LINE
```

## 📊 การตรวจสอบสถานะ

### ตรวจสอบการทำงาน:
```bash
# ดู container status
docker-compose ps

# ดู logs ของ frontend
docker-compose logs frontend

# ดู environment variables
docker-compose exec frontend env | grep LINE
```

### ตรวจสอบ Network:
```bash
# ทดสอบการเชื่อมต่อกับ LINE API
curl -I https://access.line.me/oauth2/v2.1/authorize

# ทดสอบ DNS resolution
nslookup access.line.me
```

## 🎯 สรุปการแก้ไข

✅ **สิ่งที่ได้แก้ไข:**
- ลบ authorization parameters ที่ไม่จำเป็น
- ใช้การตั้งค่า LINE OAuth แบบพื้นฐาน
- เพิ่ม debug logs ที่ละเอียด

✅ **ผลลัพธ์ที่คาดหวัง:**
- แก้ไขปัญหา 400 Bad Request
- การเชื่อมต่อกับ LINE API ทำงานปกติ
- แสดงข้อความ error ที่ชัดเจน

## 🔍 การ Debug เพิ่มเติม

### หากยังมีปัญหา:
1. ตรวจสอบ Channel settings ใน LINE Developers Console
2. ตรวจสอบ Callback URL ว่าตรงกัน
3. ตรวจสอบ Scope ว่าถูกต้อง
4. ตรวจสอบ Environment Variables
5. ตรวจสอบ Network connectivity 