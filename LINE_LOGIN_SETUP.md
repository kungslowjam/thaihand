# การตั้งค่า LINE Login

## 1. การตั้งค่าใน LINE Developers Console

### ขั้นตอนที่ 1: สร้าง Channel
1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. สร้าง Channel ใหม่
3. เลือก **LINE Login** เป็น Channel type

### ขั้นตอนที่ 2: ตั้งค่า Callback URL
ใน LINE Developers Console:
- **Callback URL:** `https://thaihand.shop/api/auth/callback/line`
- **Scope:** `profile openid`

### ขั้นตอนที่ 3: เก็บข้อมูล
- **Channel ID** (ใช้เป็น LINE_CLIENT_ID)
- **Channel Secret** (ใช้เป็น LINE_CLIENT_SECRET)

## 2. การตั้งค่า Environment Variables

### ในไฟล์ .env
```env
# LINE OAuth
LINE_CLIENT_ID=your-line-channel-id
LINE_CLIENT_SECRET=your-line-channel-secret

# NextAuth
NEXTAUTH_URL=https://thaihand.shop
NEXTAUTH_SECRET=your-secret-key
```

### ใน docker-compose.yml
```yaml
environment:
  - LINE_CLIENT_ID=${LINE_CLIENT_ID}
  - LINE_CLIENT_SECRET=${LINE_CLIENT_SECRET}
  - NEXTAUTH_URL=https://thaihand.shop
  - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
```

## 3. การทดสอบ

### ขั้นตอนที่ 1: รีสตาร์ทเซิร์ฟเวอร์
```bash
docker-compose down
docker-compose up -d
```

### ขั้นตอนที่ 2: ทดสอบการเข้าสู่ระบบ
1. ไปที่ `https://thaihand.shop/login`
2. คลิกปุ่ม "เข้าสู่ระบบด้วย LINE"
3. ตรวจสอบว่าสามารถเข้าสู่ระบบได้

## 4. การแก้ไขปัญหา

### ปัญหาที่พบบ่อย:

#### 1. "Invalid client_id"
- ตรวจสอบ LINE_CLIENT_ID ว่าถูกต้อง
- ตรวจสอบ Callback URL ใน LINE Developers Console

#### 2. "Invalid redirect_uri"
- ตรวจสอบ Callback URL ว่าตรงกับที่ตั้งไว้ใน LINE Developers Console
- ใช้ `https://thaihand.shop/api/auth/callback/line`

#### 3. "Access denied"
- ตรวจสอบ Scope ว่าตั้งเป็น `profile openid`
- ตรวจสอบว่า Channel เปิดใช้งานอยู่

## 5. โครงสร้างไฟล์

```
frontend/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth configuration
│   └── login/
│       └── page.tsx                  # Login page
```

## 6. การตั้งค่าที่แนะนำ

### Production Environment
- ใช้ HTTPS เท่านั้น
- ตั้งค่า Callback URL เป็น production URL
- ใช้ environment variables สำหรับ secrets

### Development Environment
- สามารถใช้ HTTP สำหรับ localhost
- ตั้งค่า Callback URL เป็น `http://localhost:3000/api/auth/callback/line`

## 7. การตรวจสอบ Logs

### ดู logs ของ frontend
```bash
docker-compose logs frontend
```

### ดู logs ของ backend
```bash
docker-compose logs backend
```

## 8. การอัปเดต

### อัปเดต NextAuth
```bash
cd frontend
npm update next-auth
```

### อัปเดต Docker images
```bash
docker-compose pull
docker-compose up -d
```

## 9. ความปลอดภัย

### ข้อควรระวัง:
- อย่าเปิดเผย LINE_CLIENT_SECRET
- ใช้ HTTPS ใน production
- ตรวจสอบ Callback URL อย่างระมัดระวัง
- ใช้ strong NEXTAUTH_SECRET

### การตรวจสอบความปลอดภัย:
- ตรวจสอบว่า secrets ไม่ถูก commit ไปยัง git
- ตรวจสอบว่า environment variables ถูกตั้งค่าถูกต้อง
- ตรวจสอบ logs เพื่อหาการเข้าถึงที่ไม่ได้รับอนุญาต 