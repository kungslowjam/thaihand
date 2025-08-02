# LINE OAuth Fix Summary

## ปัญหาที่พบ
- เกิด OAuthSignin error จาก domain mismatch (localhost vs production)
- มีการ fetch ไป `https://localhost:3000/login?error=OAuthSignin`
- แต่ referrer มาจาก `https://thaihand.shop/login`

## การแก้ไขที่ทำแล้ว

### 1. ลด Complexity ของ LineProvider
```typescript
// เปลี่ยนจาก custom configuration เป็น standard
LineProvider({
  clientId: process.env.LINE_CLIENT_ID!,
  clientSecret: process.env.LINE_CLIENT_SECRET!,
})
```

### 2. แก้ไข Domain Handling
- เพิ่ม `getBaseUrl()` function เพื่อ dynamic URL detection
- เพิ่ม `NEXT_PUBLIC_FORCE_DOMAIN` environment variable
- ปรับ redirect callback ให้ handle domain mismatch

### 3. ลบไฟล์ที่ไม่จำเป็น
- ลบ `frontend/app/api/auth/callback/line/route.ts`
- ใช้ standard NextAuth callback

## สิ่งที่ต้องตรวจสอบใน LINE Developer Console

### Required Redirect URI
```
https://thaihand.shop/api/auth/callback/line
```

### Required Scopes
```
profile openid
```

### Channel Settings
1. ไปที่ LINE Developers Console
2. เลือก Channel ที่ใช้
3. ตรวจสอบ Callback URL ใน "LINE Login" settings
4. ต้องเป็น: `https://thaihand.shop/api/auth/callback/line`

## วิธีทดสอบ
1. Restart Docker containers
2. ลองกด Login with LINE
3. ตรวจสอบ console logs สำหรับ debug information

## หากยังมีปัญหา
1. ตรวจสอบ LINE_CLIENT_ID และ LINE_CLIENT_SECRET ใน .env
2. ตรวจสอบ NEXTAUTH_SECRET
3. ตรวจสอบ Callback URL ใน LINE Console ต้องตรงกับ production domain