# การตั้งค่า LINE OAuth ใหม่

## ขั้นตอนการตั้งค่า LINE OAuth

### 1. สร้าง LINE Channel

1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. สร้าง Provider ใหม่ (ถ้ายังไม่มี)
3. สร้าง Channel ใหม่เลือกประเภท "Web App"
4. ตั้งชื่อ Channel และอัปโหลดรูปภาพ

### 2. ตั้งค่า Channel

#### Basic Settings
- **Channel name**: ชื่อแอปของคุณ
- **Channel description**: คำอธิบายแอป
- **Category**: เลือกหมวดหมู่ที่เหมาะสม
- **Subcategory**: เลือกหมวดหมู่ย่อย

#### Messaging API Settings
- **Channel ID**: เก็บไว้ใช้เป็น `LINE_CLIENT_ID`
- **Channel Secret**: เก็บไว้ใช้เป็น `LINE_CLIENT_SECRET`

### 3. ตั้งค่า OAuth

#### Callback URL
```
https://thaihand.shop/api/auth/callback/line
```

#### Scope
- `profile` - สำหรับดึงข้อมูลโปรไฟล์
- `openid` - สำหรับ OpenID Connect

### 4. ตั้งค่า Environment Variables

เพิ่มตัวแปรต่อไปนี้ในไฟล์ `.env`:

```env
# LINE OAuth
LINE_CLIENT_ID=your-line-channel-id
LINE_CLIENT_SECRET=your-line-channel-secret
NEXT_PUBLIC_LINE_CLIENT_ID=your-line-channel-id

# NextAuth Configuration
NEXTAUTH_URL=https://thaihand.shop
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_DEBUG=true
NEXTAUTH_LOGGING=true
```

### 5. ตรวจสอบการตั้งค่า

#### ตรวจสอบ Callback URL
- ต้องตรงกับที่ตั้งไว้ใน LINE Developers Console
- ต้องเป็น HTTPS (ยกเว้น localhost)

#### ตรวจสอบ Scope
- ต้องมี `profile` และ `openid`
- ต้องตรงกับที่ตั้งไว้ใน LINE Developers Console

### 6. การทดสอบ

1. รันแอปพลิเคชัน
2. ไปที่หน้า login
3. คลิก "เข้าสู่ระบบด้วย LINE"
4. ตรวจสอบว่า redirect ไปยัง LINE OAuth ได้
5. ตรวจสอบว่า callback กลับมาที่แอปได้
6. ตรวจสอบว่าเข้าสู่ระบบสำเร็จ

### 7. การแก้ไขปัญหา

#### ปัญหาที่พบบ่อย

**Error: invalid_client**
- ตรวจสอบ LINE_CLIENT_ID และ LINE_CLIENT_SECRET
- ตรวจสอบว่า Channel เปิดใช้งานแล้ว

**Error: invalid_redirect_uri**
- ตรวจสอบ Callback URL ใน LINE Developers Console
- ตรวจสอบ Callback URL ใน NextAuth configuration

**Error: invalid_scope**
- ตรวจสอบ Scope ที่ตั้งไว้
- ตรวจสอบว่า Channel รองรับ Scope ที่ขอ

**Error: access_denied**
- ผู้ใช้ปฏิเสธการเข้าสู่ระบบ
- ตรวจสอบการตั้งค่า Channel

#### การ Debug

เปิด debug mode:
```env
NEXTAUTH_DEBUG=true
NEXTAUTH_LOGGING=true
```

ตรวจสอบ logs ใน console เพื่อดูรายละเอียด error

### 8. การอัปเดต

เมื่อมีการเปลี่ยนแปลงการตั้งค่า:
1. อัปเดต environment variables
2. รีสตาร์ทแอปพลิเคชัน
3. ทดสอบการเข้าสู่ระบบใหม่

### 9. Security Considerations

- เก็บ LINE_CLIENT_SECRET ไว้เป็นความลับ
- ใช้ HTTPS เท่านั้นใน production
- ตรวจสอบ Callback URL ให้ถูกต้อง
- ใช้ state parameter เพื่อป้องกัน CSRF
- ตรวจสอบ token validation

### 10. Production Checklist

- [ ] ใช้ HTTPS
- [ ] ตั้งค่า Callback URL ถูกต้อง
- [ ] ตรวจสอบ environment variables
- [ ] ทดสอบการเข้าสู่ระบบ
- [ ] ตรวจสอบ error handling
- [ ] เปิดใช้งาน Channel ใน LINE Developers Console 