# การตั้งค่า LINE Login

## ขั้นตอนการตั้งค่า LINE OAuth

### 1. สร้าง LINE Login Channel

1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. สร้าง Provider ใหม่ (ถ้ายังไม่มี)
3. สร้าง Channel ใหม่เลือก "LINE Login"
4. ตั้งค่าข้อมูลพื้นฐาน:
   - Channel name: ThaiHand
   - Channel description: ThaiHand Shopping Platform
   - Category: Shopping
   - Subcategory: Other

### 2. ตั้งค่า Callback URL

ใน LINE Developers Console ให้ตั้งค่า Callback URL:
```
https://thaihand.shop/api/auth/callback/line
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ root ของโปรเจค:

```env
# NextAuth Configuration
NEXTAUTH_URL=https://thaihand.shop
NEXTAUTH_SECRET=your-nextauth-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# LINE OAuth
LINE_CLIENT_ID=your-line-client-id
LINE_CLIENT_SECRET=your-line-client-secret
NEXT_PUBLIC_LINE_CLIENT_ID=your-line-client-id

# API URLs
NEXT_PUBLIC_API_URL=https://thaihand.shop/api
NEXT_PUBLIC_BACKEND_URL=https://thaihand.shop

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. ข้อมูลที่ต้องนำมาจาก LINE Developers Console

จาก LINE Developers Console ให้คัดลอก:
- **Channel ID** → ใช้เป็น `LINE_CLIENT_ID`
- **Channel Secret** → ใช้เป็น `LINE_CLIENT_SECRET`

### 5. การทดสอบ

1. รีสตาร์ท Docker containers:
```bash
docker-compose down
docker-compose up -d
```

2. ตรวจสอบ logs:
```bash
docker-compose logs frontend
```

3. ทดสอบการ login ด้วย LINE

### 6. การแก้ไขปัญหา

#### ปัญหาที่พบบ่อย:

1. **"unauthorized_client"** - ตรวจสอบ LINE_CLIENT_ID และ LINE_CLIENT_SECRET
2. **"invalid_request"** - ตรวจสอบ Callback URL ใน LINE Developers Console
3. **"access_denied"** - ผู้ใช้ยกเลิกการเข้าสู่ระบบ

#### การ Debug:

1. ตรวจสอบ browser console สำหรับ error messages
2. ตรวจสอบ Docker logs:
```bash
docker-compose logs frontend | grep -i line
```

### 7. การตั้งค่าเพิ่มเติม

#### สำหรับ Development:
```env
NEXTAUTH_URL=http://localhost:3000
```

#### สำหรับ Production:
```env
NEXTAUTH_URL=https://thaihand.shop
```

### 8. Security Notes

- อย่า commit ไฟล์ `.env` เข้า Git
- ใช้ environment variables แทนการ hardcode ค่า
- ตรวจสอบ Callback URL ให้ตรงกับ domain ที่ใช้งานจริง 