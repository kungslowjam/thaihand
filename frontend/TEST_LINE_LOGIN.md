# การทดสอบ Line Login

## ขั้นตอนการทดสอบ

### 1. ตรวจสอบ Environment Variables

ตรวจสอบว่า environment variables ถูกตั้งค่าถูกต้อง:

```bash
# ตรวจสอบใน .env file
LINE_CLIENT_ID=2007700233
LINE_CLIENT_SECRET=e035e453d938989b8277dfe7c885dad6
NEXTAUTH_URL=https://thaihand.shop
NEXTAUTH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4
```

### 2. ตรวจสอบ LINE Console Settings

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. ตรวจสอบ Callback URL: `https://thaihand.shop/api/auth/callback/line`
3. ตรวจสอบว่า Channel ถูก activate แล้ว

### 3. ทดสอบการ Login

1. รัน development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. ไปที่ `http://localhost:3000/login`

3. คลิกปุ่ม "เข้าสู่ระบบด้วย Line"

4. ตรวจสอบ console logs:
   - เปิด Developer Tools (F12)
   - ไปที่ Console tab
   - ดู logs ที่เกี่ยวกับ NextAuth

### 4. ตรวจสอบ Session

หลังจาก login สำเร็จ:

1. ไปที่ `/dashboard`
2. ตรวจสอบว่า session มีข้อมูลถูกต้อง
3. ตรวจสอบ provider เป็น "line"

### 5. ตรวจสอบ User Data

Line users จะมีข้อมูลดังนี้:
- `id`: Line user ID (เช่น `U1234567890abcdef`)
- `name`: Display name จาก Line
- `image`: Profile picture จาก Line
- `email`: อาจไม่มี (ถ้าไม่ได้ขอสิทธิ์ email)

## การแก้ไขปัญหา

### ปัญหา: "Callback URL mismatch"

**สาเหตุ**: Callback URL ใน LINE Console ไม่ตรงกับ NEXTAUTH_URL

**วิธีแก้**:
1. ตรวจสอบ NEXTAUTH_URL ใน .env
2. อัปเดต Callback URL ใน LINE Console
3. รีสตาร์ท server

### ปัญหา: "Invalid client_id"

**สาเหตุ**: LINE_CLIENT_ID ไม่ถูกต้อง

**วิธีแก้**:
1. ตรวจสอบ LINE_CLIENT_ID ใน .env
2. ตรวจสอบว่า Channel ถูก activate แล้ว
3. ตรวจสอบว่าใช้ Channel ID ที่ถูกต้อง

### ปัญหา: "CORS error"

**สาเหตุ**: Domain ไม่ได้อยู่ใน CORS settings

**วิธีแก้**:
1. เพิ่ม domain ใน ALLOWED_ORIGINS
2. ตรวจสอบ CORS settings ใน backend

## Debug Mode

เปิด debug mode เพื่อดู logs เพิ่มเติม:

```env
NEXTAUTH_DEBUG=true
```

## Expected Logs

เมื่อ login สำเร็จควรเห็น logs ประมาณนี้:

```
[NextAuth][debug] Callback URL: https://thaihand.shop/api/auth/callback/line
[NextAuth][debug] Provider: line
[NextAuth][debug] User: { name: "User Name", image: "https://...", id: "U123..." }
```

## การทดสอบใน Production

1. อัปเดต Callback URL เป็น production URL
2. ตรวจสอบ SSL certificate
3. ทดสอบ login flow ทั้งหมด
4. ตรวจสอบ session persistence 