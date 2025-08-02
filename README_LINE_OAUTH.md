# LINE OAuth Integration

## ภาพรวม

ระบบ LINE OAuth ใหม่ได้รับการปรับปรุงให้ทำงานได้ดีขึ้น พร้อมการจัดการ error ที่ครอบคลุมและ user experience ที่ดีขึ้น

## คุณสมบัติใหม่

### 🔧 การปรับปรุงหลัก
- **Error Handling ที่ดีขึ้น**: จัดการ error ต่างๆ ของ LINE OAuth ได้ครอบคลุม
- **Loading States**: แสดงสถานะ loading ขณะเข้าสู่ระบบ
- **Better UX**: UI ที่ดีขึ้นพร้อม error messages ที่ชัดเจน
- **Debug Mode**: เปิด debug mode เพื่อตรวจสอบปัญหา
- **Security**: เพิ่มความปลอดภัยด้วย state parameter

### 🛠️ Technical Improvements
- **Custom Callback Handler**: จัดการ callback จาก LINE ได้ดีขึ้น
- **Enhanced Error Routes**: จัดการ error ต่างๆ ได้ครอบคลุม
- **Better Token Handling**: จัดการ token และ user info ได้ดีขึ้น
- **Improved Logging**: เพิ่ม logging เพื่อ debug

## การติดตั้ง

### 1. ตั้งค่า Environment Variables

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

### 2. ตั้งค่า LINE Developers Console

1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. สร้าง Channel ประเภท "Web App"
3. ตั้งค่า Callback URL: `https://thaihand.shop/api/auth/callback/line`
4. เลือก Scope: `profile openid`
5. เก็บ Channel ID และ Channel Secret

### 3. รันแอปพลิเคชัน

```bash
# Development
npm run dev

# Production
docker-compose up -d
```

## การใช้งาน

### การเข้าสู่ระบบ

1. ไปที่หน้า login: `https://thaihand.shop/login`
2. คลิกปุ่ม "เข้าสู่ระบบด้วย LINE"
3. ระบบจะ redirect ไปยัง LINE OAuth
4. หลังจาก authorize แล้วจะกลับมาที่ dashboard

### การจัดการ Error

ระบบจะแสดง error messages ที่เหมาะสมเมื่อเกิดปัญหา:

- **Network Errors**: การเชื่อมต่อถูกตัด
- **OAuth Errors**: ปัญหาจาก LINE OAuth
- **Configuration Errors**: การตั้งค่าไม่ถูกต้อง
- **User Cancellation**: ผู้ใช้ยกเลิกการเข้าสู่ระบบ

## การ Debug

### เปิด Debug Mode

```env
NEXTAUTH_DEBUG=true
NEXTAUTH_LOGGING=true
```

### ตรวจสอบ Logs

```bash
# ดู logs ของ frontend
docker-compose logs frontend

# ดู logs แบบ real-time
docker-compose logs -f frontend
```

### ตรวจสอบ Network

```bash
# ทดสอบการเชื่อมต่อกับ LINE API
curl -I https://access.line.me/oauth2/v2.1/authorize

# ทดสอบ Callback URL
curl -I https://thaihand.shop/api/auth/callback/line
```

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. Error: invalid_client
**สาเหตุ**: LINE_CLIENT_ID หรือ LINE_CLIENT_SECRET ไม่ถูกต้อง
**วิธีแก้**:
- ตรวจสอบ environment variables
- ตรวจสอบ Channel status ใน LINE Developers Console

#### 2. Error: invalid_redirect_uri
**สาเหตุ**: Callback URL ไม่ตรงกับที่ตั้งไว้
**วิธีแก้**:
- ตรวจสอบ Callback URL ใน LINE Developers Console
- ตรวจสอบ Callback URL ใน NextAuth configuration

#### 3. Error: invalid_scope
**สาเหตุ**: Scope ไม่ถูกต้อง
**วิธีแก้**:
- ตรวจสอบ Scope ใน LINE Developers Console
- ตรวจสอบ Scope ใน NextAuth configuration

#### 4. Error: access_denied
**สาเหตุ**: ผู้ใช้ปฏิเสธการเข้าสู่ระบบ
**วิธีแก้**:
- ตรวจสอบการตั้งค่า Channel
- ตรวจสอบ Bot settings

### การตรวจสอบ

#### ตรวจสอบ Environment Variables
```bash
docker-compose exec frontend env | grep LINE
```

#### ตรวจสอบ Container Status
```bash
docker-compose ps
```

#### ตรวจสอบ Network Connectivity
```bash
docker-compose exec frontend ping access.line.me
```

## Security Considerations

### 🔒 Security Measures
- ใช้ HTTPS เท่านั้นใน production
- เก็บ secrets ไว้เป็นความลับ
- ใช้ state parameter เพื่อป้องกัน CSRF
- ตรวจสอบ token validation
- จัดการ error อย่างปลอดภัย

### 🛡️ Best Practices
- เปลี่ยน secrets เป็นประจำ
- ตรวจสอบ logs เป็นประจำ
- อัปเดต dependencies
- ใช้ environment variables
- ตรวจสอบ security updates

## การบำรุงรักษา

### การอัปเดต
1. อัปเดต environment variables เมื่อจำเป็น
2. ตรวจสอบ LINE SDK updates
3. ทดสอบหลังการอัปเดต
4. เก็บ backup ของการตั้งค่า

### การ Monitor
1. ตรวจสอบ logs เป็นประจำ
2. ตรวจสอบ error rates
3. ตรวจสอบ user feedback
4. ตรวจสอบ performance

## การสนับสนุน

### 📚 Documentation
- [LINE OAuth Setup Guide](LINE_OAUTH_SETUP.md)
- [LINE OAuth Checklist](LINE_OAUTH_CHECKLIST.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)

### 🔧 Support
- ตรวจสอบ logs ก่อน
- ใช้ debug mode
- ตรวจสอบ environment variables
- ตรวจสอบ LINE Developers Console

## การเปลี่ยนแปลงจากเวอร์ชันเก่า

### ✅ การปรับปรุง
- เพิ่ม error handling ที่ครอบคลุม
- ปรับปรุง UI/UX
- เพิ่ม loading states
- เพิ่ม debug mode
- ปรับปรุง security

### 🔄 Breaking Changes
- เปลี่ยน Callback URL structure
- เพิ่ม environment variables ใหม่
- ปรับปรุง error messages
- เปลี่ยน NextAuth configuration

### 📈 Performance Improvements
- ลด network requests
- ปรับปรุง error handling
- เพิ่ม caching
- ปรับปรุง loading states 