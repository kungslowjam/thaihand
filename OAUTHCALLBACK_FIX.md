# การแก้ไขปัญหา OAuthCallback Error

## ปัญหาที่พบ

จากข้อมูลที่คุณแสดงมา:
```
fetch("https://localhost:3000/login?error=OAuthCallback", {
  "headers": {
    "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Microsoft Edge\";v=\"138\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "upgrade-insecure-requests": "1"
  },
  "referrer": "https://access.line.me/oauth2/v2.1/ssoLogin?loginChannelId=2007700233&returnUri=%2Foauth2%2Fv2.1%2Fauthorize%2Fconsent%3Fclient_id%3D2007700233%26scope%3Dprofile%2520openid%2520email%26response_type%3Dcode%26redirect_uri%3Dhttps%253A%252F%252Fthaihand.shop%252Fapi%252Fauth%252Fcallback%252Fline%26state%3DV72LXBFCe9itTHW93_6jV1y6X7nF3qKp2KW2drihZgw",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "omit"
});
```

**ปัญหาหลัก:**
1. URL ที่ redirect กลับมามี `localhost:3000` แทนที่จะเป็น production URL
2. เกิด OAuthCallback error จากการ redirect ที่ไม่ถูกต้อง
3. การตั้งค่า callback URL ไม่ตรงกับที่ตั้งไว้ใน LINE Developers Console

## การแก้ไขที่ทำไป

### 1. แก้ไขการตั้งค่า LineProvider

**ไฟล์:** `frontend/app/api/auth/[...nextauth]/route.ts`

**การเปลี่ยนแปลง:**
- เพิ่ม `redirect_uri` ใน authorization parameters
- แก้ไข scope เป็น `'profile openid email'`
- เพิ่มการจัดการ OAuthCallback error

```typescript
LineProvider({
  clientId: process.env.LINE_CLIENT_ID!,
  clientSecret: process.env.LINE_CLIENT_SECRET!,
  authorization: {
    url: "https://access.line.me/oauth2/v2.1/authorize",
    params: {
      scope: 'profile openid email',
      response_type: 'code',
      state: 'random_state_string',
      redirect_uri: 'https://thaihand.shop/api/auth/callback/line',
    },
  },
  token: {
    url: "https://api.line.me/oauth2/v2.1/token",
  },
  userinfo: {
    url: "https://api.line.me/v2/profile",
  },
}),
```

### 2. เพิ่มการจัดการ OAuthCallback Error

**การเปลี่ยนแปลง:**
- เพิ่มการตรวจสอบ `error=OAuthCallback` ใน redirect callback
- สร้างไฟล์ callback route เฉพาะสำหรับ LINE

```typescript
// จัดการ OAuthCallback error
if (url.includes('error=OAuthCallback')) {
  console.log('OAUTH CALLBACK ERROR - Redirecting to login with error');
  return baseUrl + '/login?error=OAuthCallback&message=เกิดข้อผิดพลาดในการ callback จาก LINE';
}
```

### 3. สร้างไฟล์ Callback Route เฉพาะ

**ไฟล์:** `frontend/app/api/auth/callback/line/route.ts`

**หน้าที่:**
- จัดการ callback จาก LINE OAuth
- ตรวจสอบ error และ code parameters
- Redirect ไปยัง NextAuth callback หรือ login page

### 4. ปรับปรุง Login Page

**ไฟล์:** `frontend/app/login/page.tsx`

**การเปลี่ยนแปลง:**
- เพิ่มการจัดการ OAuthCallback error
- ปรับปรุง error messages ให้ชัดเจนขึ้น

```typescript
} else if (errorParam === 'OAuthCallback') {
  setError(messageParam || 'เกิดข้อผิดพลาดในการ callback จาก LINE กรุณาลองใหม่อีกครั้ง');
}
```

## ขั้นตอนการทดสอบ

### 1. ตรวจสอบการตั้งค่า

```bash
# รัน script ตรวจสอบ
node check_line_oauth.js
```

### 2. รีสตาร์ท Services

```bash
# หยุด services
docker-compose down

# เริ่ม services ใหม่
docker-compose up -d

# ตรวจสอบ status
docker-compose ps
```

### 3. ตรวจสอบ Logs

```bash
# ดู logs เฉพาะ LINE
docker-compose logs frontend | grep -i line

# ดู logs แบบ real-time
docker-compose logs -f frontend
```

### 4. ทดสอบ Login

1. ไปที่หน้า login
2. คลิกปุ่ม "เข้าสู่ระบบด้วย LINE"
3. ตรวจสอบการ redirect และ error messages

## การตั้งค่า LINE Developers Console

### 1. ตรวจสอบ Callback URL

ใน LINE Developers Console ให้ตั้งค่า Callback URL:
```
https://thaihand.shop/api/auth/callback/line
```

### 2. ตรวจสอบ Scope

ตรวจสอบว่า scope ตั้งเป็น:
```
profile openid email
```

### 3. ตรวจสอบ Channel Settings

- Channel ID: ใช้เป็น `LINE_CLIENT_ID`
- Channel Secret: ใช้เป็น `LINE_CLIENT_SECRET`
- Callback URL: `https://thaihand.shop/api/auth/callback/line`

## การแก้ไขปัญหาเพิ่มเติม

### 1. ปัญหา localhost URL

หากยังเจอ localhost URL ให้ตรวจสอบ:
- Environment variable `NEXTAUTH_URL` ตั้งเป็น `https://thaihand.shop`
- ตรวจสอบ docker-compose.yml ว่าส่ง environment variables ถูกต้อง

### 2. ปัญหา CORS

หากเจอ CORS error ให้ตรวจสอบ:
- ตั้งค่า CORS ใน backend
- ตรวจสอบ nginx configuration

### 3. ปัญหา SSL/HTTPS

หากเจอ SSL error ให้ตรวจสอบ:
- SSL certificate ถูกต้อง
- nginx SSL configuration

## คำแนะนำสำหรับการใช้งาน

### 1. การตั้งค่า Environment Variables

```env
NEXTAUTH_URL=https://thaihand.shop
LINE_CLIENT_ID=your-line-channel-id
LINE_CLIENT_SECRET=your-line-channel-secret
NEXT_PUBLIC_LINE_CLIENT_ID=your-line-channel-id
```

### 2. การตรวจสอบ Logs

```bash
# ตรวจสอบ environment variables
docker-compose exec frontend env | grep -E "(LINE|NEXTAUTH)"

# ตรวจสอบ logs
docker-compose logs frontend | grep -i oauth
```

### 3. การ Debug

1. เปิด Developer Tools (F12)
2. ไปที่ Network tab
3. ลอง login ด้วย LINE
4. ตรวจสอบ requests ที่ส่งไปยัง LINE API

## ผลลัพธ์ที่คาดหวัง

หลังจากการแก้ไขนี้:
1. ไม่ควรเจอ localhost URL ใน redirect
2. OAuthCallback error ควรหายไป
3. LINE login ควรทำงานได้อย่างถูกต้อง
4. Error messages ควรชัดเจนและเป็นประโยชน์

## ติดต่อ Support

หากยังมีปัญหา:
1. ตรวจสอบ logs: `docker-compose logs frontend`
2. รัน test script: `node check_line_oauth.js`
3. ตรวจสอบ LINE Developers Console settings
4. ติดต่อทีมพัฒนาเพื่อขอความช่วยเหลือเพิ่มเติม 