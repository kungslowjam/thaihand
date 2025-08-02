# การตรวจสอบการตั้งค่า LINE OAuth ตามเอกสาร

## การตั้งค่าตาม NextAuth.js Documentation

จากเอกสาร [NextAuth.js LINE Provider](https://next-auth.js.org/providers/line#options):

### 1. การตั้งค่าพื้นฐาน

```typescript
import LineProvider from "next-auth/providers/line";

providers: [
  LineProvider({
    clientId: process.env.LINE_CLIENT_ID,
    clientSecret: process.env.LINE_CLIENT_SECRET
  })
]
```

### 2. Callback URL ที่แนะนำ

สำหรับ development:
```
http://localhost:3000/api/auth/callback/line
```

สำหรับ production:
```
https://thaihand.shop/api/auth/callback/line
```

### 3. การขอสิทธิ์ Email Address

ตามเอกสาร NextAuth.js:
> "To retrieve email address, you need to apply for Email address permission. Open Line Developer Console, go to your Login Channel. Scroll down bottom to find **OpenID Connect** -> **Email address permission**. Click **Apply** and follow the instruction."

## การตั้งค่าตาม LINE Developers Documentation

จากเอกสาร [LINE Login Integration](https://developers.line.biz/en/docs/line-login/integrate-line-login/#scopes):

### 1. Authorization URL Format

```
https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=1234567890&redirect_uri=https%3A%2F%2Fexample.com%2Fauth%3Fkey%3Dvalue&state=12345abcde&scope=profile%20openid&nonce=09876xyz
```

### 2. Required Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| response_type | String | Required | `code` |
| client_id | String | Required | LINE Login Channel ID |
| redirect_uri | String | Required | URL-encoded callback URL |
| state | String | Required | Unique alphanumeric string for CSRF protection |
| scope | String | Required | `profile openid` (email requires permission) |

### 3. Scope Options

ตามเอกสาร LINE:
- `profile` - ข้อมูลโปรไฟล์พื้นฐาน
- `openid` - จำเป็นสำหรับ OpenID Connect
- `email` - ต้องขอสิทธิ์ก่อนใช้งาน

### 4. Error Codes

| Error Code | Description |
|------------|-------------|
| INVALID_REQUEST | Problem with request parameters |
| ACCESS_DENIED | User canceled consent |
| UNSUPPORTED_RESPONSE_TYPE | response_type not supported |
| INVALID_SCOPE | Problem with scope parameter |
| SERVER_ERROR | Unexpected server error |
| LOGIN_REQUIRED | Auto login failed |
| INTERACTION_REQUIRED | Auto login couldn't work |

## การตรวจสอบการตั้งค่า

### 1. ตรวจสอบ LINE Developers Console

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก Channel ที่สร้างไว้
3. ตรวจสอบ **LINE Login** tab
4. ตั้งค่า Callback URL:
   ```
   https://thaihand.shop/api/auth/callback/line
   ```

### 2. ขอสิทธิ์ Email Address

1. ใน LINE Developers Console
2. ไปที่ **Basic settings** tab
3. ใต้ **OpenID Connect** section
4. คลิก **Apply** สำหรับ **Email address permission**
5. อัปโหลด screenshot ที่อธิบายการใช้งาน email
6. รอการอนุมัติ

### 3. ตรวจสอบ Environment Variables

```env
# NextAuth Configuration
NEXTAUTH_URL=https://thaihand.shop
NEXTAUTH_SECRET=your-nextauth-secret

# LINE OAuth
LINE_CLIENT_ID=your-line-channel-id
LINE_CLIENT_SECRET=your-line-channel-secret
NEXT_PUBLIC_LINE_CLIENT_ID=your-line-channel-id
```

### 4. ตรวจสอบ Authorization URL

สร้าง authorization URL ตามรูปแบบ:
```
https://access.line.me/oauth2/v2.1/authorize?
  response_type=code&
  client_id=YOUR_CHANNEL_ID&
  redirect_uri=https%3A%2F%2Fthaihand.shop%2Fapi%2Fauth%2Fcallback%2Fline&
  state=random_state_string&
  scope=profile%20openid%20email
```

## การแก้ไขปัญหา

### 1. ปัญหา INVALID_SCOPE

**สาเหตุ:** Scope ไม่ถูกต้อง
**วิธีแก้ไข:**
- ตรวจสอบว่า scope ตั้งเป็น `profile openid email`
- หากใช้ email scope ต้องขอสิทธิ์ก่อน

### 2. ปัญหา INVALID_REQUEST

**สาเหตุ:** Parameters ไม่ถูกต้อง
**วิธีแก้ไข:**
- ตรวจสอบ client_id และ client_secret
- ตรวจสอบ redirect_uri ว่าตรงกับที่ตั้งไว้ใน LINE Developers Console

### 3. ปัญหา ACCESS_DENIED

**สาเหตุ:** ผู้ใช้ยกเลิกการเข้าสู่ระบบ
**วิธีแก้ไข:**
- ตรวจสอบว่า LINE app ทำงานปกติ
- ลองใหม่อีกครั้ง

## การทดสอบ

### 1. ทดสอบ Authorization URL

```bash
# สร้าง authorization URL
curl -G "https://access.line.me/oauth2/v2.1/authorize" \
  --data-urlencode "response_type=code" \
  --data-urlencode "client_id=YOUR_CHANNEL_ID" \
  --data-urlencode "redirect_uri=https://thaihand.shop/api/auth/callback/line" \
  --data-urlencode "state=test_state" \
  --data-urlencode "scope=profile openid email"
```

### 2. ทดสอบ Token Exchange

```bash
# ทดสอบการแลก token
curl -X POST "https://api.line.me/oauth2/v2.1/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTHORIZATION_CODE" \
  --data-urlencode "redirect_uri=https://thaihand.shop/api/auth/callback/line" \
  -d "client_id=YOUR_CHANNEL_ID" \
  -d "client_secret=YOUR_CHANNEL_SECRET"
```

### 3. ทดสอบ Profile API

```bash
# ทดสอบการดึงข้อมูลโปรไฟล์
curl -H "Authorization: Bearer ACCESS_TOKEN" \
  "https://api.line.me/v2/profile"
```

## คำแนะนำ

### 1. Development vs Production

- **Development:** ใช้ `http://localhost:3000/api/auth/callback/line`
- **Production:** ใช้ `https://thaihand.shop/api/auth/callback/line`

### 2. Security

- ใช้ state parameter เพื่อป้องกัน CSRF
- ตรวจสอบ state parameter ใน callback
- ใช้ HTTPS ใน production

### 3. Error Handling

- จัดการ error codes ทั้งหมด
- แสดงข้อความ error ที่ชัดเจน
- Log errors สำหรับ debugging

## อ้างอิง

- [NextAuth.js LINE Provider](https://next-auth.js.org/providers/line#options)
- [LINE Login Integration Guide](https://developers.line.biz/en/docs/line-login/integrate-line-login/#scopes)
- [LINE Developers Console](https://developers.line.biz/console/) 