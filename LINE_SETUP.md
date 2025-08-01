# คู่มือการตั้งค่า LINE Developers Console

## 1. สร้าง Channel ใน LINE Developers Console

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. สร้าง Provider ใหม่ (ถ้ายังไม่มี)
3. สร้าง Channel ใหม่:
   - เลือก "LINE Login"
   - Channel name: `ThaiHand Login`
   - Channel description: `OAuth login for ThaiHand platform`
   - Category: `Shopping`
   - Subcategory: `Marketplace`

## 2. ตั้งค่า Callback URL

ใน LINE Developers Console > Channel > LINE Login > Callback URL:

```
https://thaihand.shop/api/auth/callback/line
```

**สำคัญ:** ต้องใช้ HTTPS และ domain ที่ถูกต้อง

## 3. ตั้งค่า Scope

ใน LINE Developers Console > Channel > LINE Login > Scope:
- ✅ `profile`
- ✅ `openid`
- ✅ `email` (ต้องสมัครขอ permission)

## 4. ขอ Email Permission

1. ไปที่ LINE Developers Console > Channel > LINE Login
2. เลื่อนลงไปด้านล่าง
3. หา "OpenID Connect" > "Email address permission"
4. คลิก "Apply" และทำตามขั้นตอน

## 5. ตั้งค่า Bot link

ใน LINE Developers Console > Channel > Messaging API:
- Bot link: `https://thaihand.shop`

## 6. ตรวจสอบ Environment Variables

ในไฟล์ `.env` บน VPS:

```bash
LINE_CLIENT_ID=2007700233
LINE_CLIENT_SECRET=e035e453d938989b8277dfe7c885dad6
NEXT_PUBLIC_LINE_CLIENT_ID=2007700233
```

## 7. Restart Application

```bash
docker-compose down
docker-compose up -d --build
```

## 8. ทดสอบ

1. ไปที่ `https://thaihand.shop/login`
2. คลิกปุ่ม "เข้าสู่ระบบด้วย LINE"
3. ควร redirect ไปยัง LINE OAuth

## ข้อผิดพลาดที่พบบ่อย

### Callback URL ไม่ถูกต้อง
- ต้องใช้ `https://thaihand.shop/api/auth/callback/line`
- ไม่ใช่ `http://localhost:3000/api/auth/callback/line`

### Email Permission ไม่ได้รับ
- ต้องสมัครขอ Email permission ใน LINE Developers Console
- ถ้าไม่ได้รับ permission จะไม่มี email ใน session

### Environment Variables ไม่ถูกต้อง
- ตรวจสอบว่า LINE_CLIENT_ID และ LINE_CLIENT_SECRET ถูกต้อง
- ตรวจสอบว่า NEXT_PUBLIC_LINE_CLIENT_ID มีค่าเดียวกับ LINE_CLIENT_ID 