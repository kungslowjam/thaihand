# การตั้งค่า LINE Login สำหรับ ThaiHand

## 1. การสร้าง LINE Channel

### 1.1 เข้าไปที่ LINE Developers Console
- ไปที่ https://developers.line.biz/
- เข้าสู่ระบบด้วย LINE account

### 1.2 สร้าง Provider
- คลิก "Create Provider"
- กรอก Provider name: `ThaiHand`
- เลือก Provider type: `Company`
- คลิก "Create"

### 1.3 สร้าง Channel
- คลิก "Create Channel"
- เลือก "LINE Login"
- กรอกข้อมูล:
  - Channel name: `ThaiHand Login`
  - Channel description: `LINE Login for ThaiHand platform`
  - Category: `Shopping`
  - Subcategory: `Marketplace`
- คลิก "Create"

## 2. การตั้งค่า Channel

### 2.1 Basic Settings
- Channel ID: คัดลอกไว้ใช้เป็น `LINE_CLIENT_ID`
- Channel Secret: คัดลอกไว้ใช้เป็น `LINE_CLIENT_SECRET`

### 2.2 LINE Login Settings
- Callback URL: `https://thaihand.shop/api/auth/callback/line`
- สำหรับ Development: `http://localhost:3000/api/auth/callback/line`

### 2.3 Bot Settings (ถ้าต้องการ)
- Bot basic ID: ตั้งค่าตามต้องการ
- Bot description: อธิบายการใช้งาน

## 3. การตั้งค่า Environment Variables

### 3.1 ในไฟล์ .env
```env
# LINE OAuth Configuration
LINE_CLIENT_ID=your-line-channel-id
LINE_CLIENT_SECRET=your-line-channel-secret
NEXT_PUBLIC_LINE_CLIENT_ID=your-line-channel-id

# NextAuth Configuration
NEXTAUTH_URL=https://thaihand.shop
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_DEBUG=true
```

### 3.2 ในไฟล์ .env.local (สำหรับ development)
```env
# LINE OAuth Configuration
LINE_CLIENT_ID=your-line-channel-id
LINE_CLIENT_SECRET=your-line-channel-secret
NEXT_PUBLIC_LINE_CLIENT_ID=your-line-channel-id

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_DEBUG=true
```

## 4. การทดสอบ LINE Login

### 4.1 ทดสอบใน Development
1. รันโปรเจค: `npm run dev`
2. ไปที่ http://localhost:3000/login
3. คลิก "เข้าสู่ระบบด้วย LINE"
4. ตรวจสอบการ redirect ไป LINE และกลับมา

### 4.2 ทดสอบใน Production
1. Deploy โปรเจค
2. ไปที่ https://thaihand.shop/login
3. ทดสอบ LINE login
4. ตรวจสอบ logs ใน production

## 5. การแก้ไขปัญหา

### 5.1 ปัญหาที่พบบ่อย

#### Error: "invalid_client"
- ตรวจสอบ LINE_CLIENT_ID และ LINE_CLIENT_SECRET
- ตรวจสอบ Callback URL ใน LINE Developers Console

#### Error: "redirect_uri_mismatch"
- ตรวจสอบ Callback URL ใน LINE Developers Console
- ต้องตรงกับที่ตั้งค่าใน NextAuth

#### Error: "access_denied"
- ผู้ใช้ยกเลิกการเข้าสู่ระบบ
- ตรวจสอบ scope ที่ขอ

### 5.2 การ Debug
1. เปิด NEXTAUTH_DEBUG=true
2. ตรวจสอบ console logs
3. ตรวจสอบ Network tab ใน browser
4. ตรวจสอบ LINE Developers Console logs

## 6. Security Considerations

### 6.1 Environment Variables
- อย่า commit LINE_CLIENT_SECRET ลง git
- ใช้ .env.local สำหรับ development
- ใช้ environment variables ใน production

### 6.2 Callback URL
- ใช้ HTTPS ใน production
- ตรวจสอบ domain name ให้ถูกต้อง
- อย่าใช้ localhost ใน production

### 6.3 Token Security
- ตรวจสอบ token expiration
- ใช้ refresh token เมื่อจำเป็น
- Revoke token เมื่อ logout

## 7. การอัปเดต

### 7.1 อัปเดต LINE SDK
```bash
npm update next-auth
```

### 7.2 อัปเดต Channel Settings
- ตรวจสอบ LINE Developers Console เป็นประจำ
- อัปเดต Callback URL เมื่อเปลี่ยน domain
- ตรวจสอบ Channel status

## 8. Monitoring และ Logging

### 8.1 การ Monitor
- ตรวจสอบ login success rate
- ตรวจสอบ error logs
- ตรวจสอบ user activity

### 8.2 การ Log
```javascript
// ใน NextAuth callbacks
console.log('LINE Login:', {
  provider: account?.provider,
  userId: user?.id,
  timestamp: new Date().toISOString()
});
```

## 9. การ Backup และ Recovery

### 9.1 Backup Channel Settings
- เก็บ Channel ID และ Secret ไว้
- เก็บ Callback URL settings
- เก็บ Bot settings (ถ้ามี)

### 9.2 Recovery Plan
- สร้าง Channel ใหม่ถ้าจำเป็น
- อัปเดต environment variables
- ทดสอบการทำงานหลัง recovery

## 10. การติดต่อ Support

### 10.1 LINE Developers Support
- LINE Developers Documentation: https://developers.line.biz/docs/
- LINE Developers Community: https://developers.line.biz/community/

### 10.2 NextAuth Support
- NextAuth Documentation: https://next-auth.js.org/
- NextAuth GitHub: https://github.com/nextauthjs/next-auth 