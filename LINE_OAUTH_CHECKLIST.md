# LINE OAuth Checklist

## การตั้งค่า LINE Developers Console

### ✅ Basic Settings
- [ ] สร้าง Provider แล้ว
- [ ] สร้าง Channel ประเภท "Web App" แล้ว
- [ ] ตั้งชื่อ Channel แล้ว
- [ ] อัปโหลดรูปภาพ Channel แล้ว
- [ ] เลือก Category และ Subcategory แล้ว

### ✅ Messaging API Settings
- [ ] เก็บ Channel ID ไว้แล้ว
- [ ] เก็บ Channel Secret ไว้แล้ว
- [ ] Channel เปิดใช้งานแล้ว

### ✅ OAuth Settings
- [ ] ตั้งค่า Callback URL: `https://thaihand.shop/api/auth/callback/line`
- [ ] เลือก Scope: `profile` และ `openid`
- [ ] เปิดใช้งาน OAuth แล้ว

## การตั้งค่า Environment Variables

### ✅ LINE OAuth Variables
- [ ] `LINE_CLIENT_ID` = Channel ID
- [ ] `LINE_CLIENT_SECRET` = Channel Secret
- [ ] `NEXT_PUBLIC_LINE_CLIENT_ID` = Channel ID

### ✅ NextAuth Variables
- [ ] `NEXTAUTH_URL` = `https://thaihand.shop`
- [ ] `NEXTAUTH_SECRET` = secret key ที่ปลอดภัย
- [ ] `NEXTAUTH_DEBUG` = `true` (สำหรับ debug)
- [ ] `NEXTAUTH_LOGGING` = `true` (สำหรับ debug)

## การตรวจสอบ Code

### ✅ NextAuth Configuration
- [ ] LineProvider ตั้งค่าถูกต้อง
- [ ] Authorization URL ถูกต้อง
- [ ] Token URL ถูกต้อง
- [ ] UserInfo URL ถูกต้อง
- [ ] Scope ถูกต้อง

### ✅ Callback Handler
- [ ] สร้างไฟล์ `/api/auth/callback/line/route.ts` แล้ว
- [ ] จัดการ error ได้
- [ ] จัดการ code parameter ได้
- [ ] Redirect ไปยัง NextAuth callback ได้

### ✅ Error Handling
- [ ] สร้างไฟล์ `/api/auth/error/route.ts` แล้ว
- [ ] จัดการ LINE OAuth errors ได้
- [ ] แสดง error messages ที่เหมาะสม
- [ ] Redirect ไปยัง login page ได้

### ✅ Login Page
- [ ] แสดง error messages ได้
- [ ] จัดการ loading state ได้
- [ ] ป้องกันการคลิกซ้ำได้
- [ ] แสดง provider-specific errors ได้

## การทดสอบ

### ✅ Local Testing
- [ ] รันแอปพลิเคชันได้
- [ ] ไปที่หน้า login ได้
- [ ] คลิก "เข้าสู่ระบบด้วย LINE" ได้
- [ ] Redirect ไปยัง LINE OAuth ได้
- [ ] Callback กลับมาที่แอปได้
- [ ] เข้าสู่ระบบสำเร็จ

### ✅ Production Testing
- [ ] ใช้ HTTPS
- [ ] Callback URL ตรงกับที่ตั้งไว้
- [ ] Environment variables ถูกต้อง
- [ ] Channel เปิดใช้งานแล้ว
- [ ] ทดสอบการเข้าสู่ระบบสำเร็จ

## การแก้ไขปัญหา

### ✅ Debug Mode
- [ ] เปิด `NEXTAUTH_DEBUG=true`
- [ ] เปิด `NEXTAUTH_LOGGING=true`
- [ ] ตรวจสอบ console logs
- [ ] ตรวจสอบ network requests

### ✅ Common Issues
- [ ] ตรวจสอบ LINE_CLIENT_ID และ LINE_CLIENT_SECRET
- [ ] ตรวจสอบ Callback URL
- [ ] ตรวจสอบ Scope
- [ ] ตรวจสอบ Channel status
- [ ] ตรวจสอบ HTTPS requirement

## Security Checklist

### ✅ Security Measures
- [ ] ใช้ HTTPS เท่านั้น
- [ ] เก็บ secrets ไว้เป็นความลับ
- [ ] ใช้ state parameter
- [ ] ตรวจสอบ token validation
- [ ] จัดการ error อย่างปลอดภัย

### ✅ Production Readiness
- [ ] ตั้งค่า environment variables ถูกต้อง
- [ ] ตรวจสอบ Callback URL
- [ ] ทดสอบการเข้าสู่ระบบ
- [ ] ตรวจสอบ error handling
- [ ] เปิดใช้งาน Channel

## การบำรุงรักษา

### ✅ Monitoring
- [ ] ตรวจสอบ logs เป็นประจำ
- [ ] ตรวจสอบ error rates
- [ ] ตรวจสอบ user feedback
- [ ] อัปเดต dependencies

### ✅ Updates
- [ ] อัปเดต LINE SDK เมื่อจำเป็น
- [ ] ตรวจสอบ security updates
- [ ] ทดสอบหลังการอัปเดต
- [ ] เก็บ backup ของการตั้งค่า

## การสำรองข้อมูล

### ✅ Configuration Backup
- [ ] เก็บ environment variables ไว้
- [ ] เก็บ LINE Channel settings ไว้
- [ ] เก็บ NextAuth configuration ไว้
- [ ] เก็บ callback URLs ไว้

### ✅ Documentation
- [ ] เขียน documentation ครบถ้วน
- [ ] อัปเดต README
- [ ] เก็บ troubleshooting guide
- [ ] เก็บ contact information 