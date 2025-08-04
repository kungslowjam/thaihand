# การตั้งค่า Line Login

## ขั้นตอนการตั้งค่า Line Login

### 1. สร้าง Line Login Channel

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. สร้าง Provider ใหม่ (ถ้ายังไม่มี)
3. สร้าง Channel ใหม่และเลือก "LINE Login"
4. ตั้งชื่อ Channel และเลือก Category

### 2. ตั้งค่า Callback URL

ใน LINE Login Channel settings:

- **Callback URL**: `https://thaihand.shop/api/auth/callback/line`
- สำหรับ development: `http://localhost:3000/api/auth/callback/line`

### 3. ขอสิทธิ์ Email Address (ถ้าต้องการ)

1. ไปที่ **Basic settings** tab
2. ในส่วน **OpenID Connect** คลิก **Apply** สำหรับ Email address permission
3. อัปโหลด screenshot ที่แสดงว่าคุณจะใช้ email address อย่างไร
4. รอการอนุมัติ

### 4. Environment Variables

เพิ่ม environment variables ต่อไปนี้ในไฟล์ `.env`:

```env
# Line OAuth Configuration
LINE_CLIENT_ID=your-line-client-id
LINE_CLIENT_SECRET=your-line-client-secret

# NextAuth Configuration
NEXTAUTH_URL=https://thaihand.shop
NEXTAUTH_SECRET=your-nextauth-secret

# สำหรับ development
NEXTAUTH_URL=http://localhost:3000
```

### 5. การทดสอบ

1. รัน development server: `npm run dev`
2. ไปที่ `/login`
3. คลิกปุ่ม "เข้าสู่ระบบด้วย Line"
4. ตรวจสอบ console logs เพื่อดูการทำงาน

## หมายเหตุ

- Line login จะสร้าง user ID แบบพิเศษ (เช่น `U1234567890abcdef@line`)
- ถ้าไม่ได้ขอสิทธิ์ email address จะไม่มี email ใน user profile
- ระบบจะสร้าง pseudo-email สำหรับ Line users ที่ไม่มี email จริง

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **Callback URL ไม่ตรงกัน**
   - ตรวจสอบ Callback URL ใน LINE Console
   - ตรวจสอบ NEXTAUTH_URL ใน environment variables

2. **Client ID/Secret ไม่ถูกต้อง**
   - ตรวจสอบ LINE_CLIENT_ID และ LINE_CLIENT_SECRET
   - ตรวจสอบว่า Channel ถูก activate แล้ว

3. **CORS Error**
   - ตรวจสอบ ALLOWED_ORIGINS ใน backend
   - เพิ่ม domain ของคุณใน CORS settings

### Debug Mode

เปิด debug mode เพื่อดู logs:

```env
NEXTAUTH_DEBUG=true
```

## อ้างอิง

- [NextAuth.js Line Provider](https://next-auth.js.org/providers/line)
- [LINE Login Documentation](https://developers.line.biz/en/docs/line-login/integrate-line-login/)
- [LINE Developers Console](https://developers.line.biz/console/) 