# การแก้ไขปัญหา LINE Login

## ปัญหาที่พบบ่อยและวิธีแก้ไข

### 1. ปัญหา "unauthorized_client"

**อาการ:** ได้รับ error "unauthorized_client" เมื่อพยายาม login ด้วย LINE

**สาเหตุ:**
- LINE_CLIENT_ID หรือ LINE_CLIENT_SECRET ไม่ถูกต้อง
- Callback URL ไม่ตรงกับที่ตั้งไว้ใน LINE Developers Console

**วิธีแก้ไข:**
1. ตรวจสอบ LINE_CLIENT_ID และ LINE_CLIENT_SECRET ในไฟล์ .env
2. ตรวจสอบ Callback URL ใน LINE Developers Console ว่าตั้งเป็น:
   ```
   https://thaihand.shop/api/auth/callback/line
   ```
3. รีสตาร์ท Docker containers:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### 2. ปัญหา "invalid_request"

**อาการ:** ได้รับ error "invalid_request"

**สาเหตุ:**
- การตั้งค่า OAuth parameters ไม่ถูกต้อง
- Scope ไม่ถูกต้อง

**วิธีแก้ไข:**
1. ตรวจสอบการตั้งค่า LineProvider ใน `frontend/app/api/auth/[...nextauth]/route.ts`
2. ตรวจสอบ scope ว่าตั้งเป็น `'profile openid'`
3. ตรวจสอบ response_type ว่าตั้งเป็น `'code'`

### 3. ปัญหา "access_denied"

**อาการ:** ได้รับ error "access_denied"

**สาเหตุ:**
- ผู้ใช้ยกเลิกการเข้าสู่ระบบ
- LINE app ไม่พร้อมใช้งาน

**วิธีแก้ไข:**
1. ตรวจสอบว่า LINE app ทำงานปกติ
2. ลองใหม่อีกครั้ง
3. ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต

### 4. ปัญหา "server_error"

**อาการ:** ได้รับ error "server_error"

**สาเหตุ:**
- LINE API server มีปัญหา
- การตั้งค่า server ไม่ถูกต้อง

**วิธีแก้ไข:**
1. รอสักครู่แล้วลองใหม่
2. ตรวจสอบ LINE API status
3. ตรวจสอบ logs:
   ```bash
   docker-compose logs frontend | grep -i line
   ```

### 5. ปัญหา "temporarily_unavailable"

**อาการ:** ได้รับ error "temporarily_unavailable"

**สาเหตุ:**
- LINE OAuth service ไม่พร้อมใช้งาน

**วิธีแก้ไข:**
1. รอสักครู่แล้วลองใหม่
2. ตรวจสอบ LINE Developers Console status

## การ Debug

### 1. ตรวจสอบ Environment Variables

```bash
# ตรวจสอบ environment variables ใน Docker container
docker-compose exec frontend env | grep -E "(LINE|NEXTAUTH)"
```

### 2. ตรวจสอบ Logs

```bash
# ดู logs ของ frontend
docker-compose logs frontend

# ดู logs เฉพาะ LINE
docker-compose logs frontend | grep -i line

# ดู logs แบบ real-time
docker-compose logs -f frontend
```

### 3. ตรวจสอบ Network

```bash
# ทดสอบการเชื่อมต่อกับ LINE API
curl -I https://api.line.me/v2/profile

# ทดสอบ NextAuth callback
curl -I https://thaihand.shop/api/auth/callback/line
```

### 4. ใช้ Test Script

```bash
# รัน test script
node test_line_login.js
```

## การตั้งค่าใหม่

### 1. สร้าง LINE Login Channel ใหม่

1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. ลบ Channel เดิม (ถ้ามี)
3. สร้าง Channel ใหม่:
   - Channel name: ThaiHand
   - Channel description: ThaiHand Shopping Platform
   - Category: Shopping
   - Subcategory: Other

### 2. ตั้งค่า Callback URL

ใน LINE Developers Console:
```
https://thaihand.shop/api/auth/callback/line
```

### 3. อัปเดต Environment Variables

ในไฟล์ `.env`:
```env
LINE_CLIENT_ID=your-new-channel-id
LINE_CLIENT_SECRET=your-new-channel-secret
NEXT_PUBLIC_LINE_CLIENT_ID=your-new-channel-id
```

### 4. รีสตาร์ท Services

```bash
# หยุด services
docker-compose down

# เริ่ม services ใหม่
docker-compose up -d

# ตรวจสอบ status
docker-compose ps
```

## การตรวจสอบการทำงาน

### 1. ตรวจสอบ Browser Console

1. เปิด Developer Tools (F12)
2. ไปที่ Console tab
3. ลอง login ด้วย LINE
4. ตรวจสอบ error messages

### 2. ตรวจสอบ Network Tab

1. เปิด Developer Tools (F12)
2. ไปที่ Network tab
3. ลอง login ด้วย LINE
4. ตรวจสอบ requests ที่ส่งไปยัง LINE API

### 3. ตรวจสอบ Application Tab

1. เปิด Developer Tools (F12)
2. ไปที่ Application tab
3. ตรวจสอบ Cookies และ Local Storage
4. ตรวจสอบ Session Storage

## คำแนะนำเพิ่มเติม

### 1. Security

- อย่า commit ไฟล์ `.env` เข้า Git
- ใช้ environment variables แทนการ hardcode ค่า
- ตรวจสอบ Callback URL ให้ตรงกับ domain ที่ใช้งานจริง

### 2. Performance

- ใช้ caching สำหรับ LINE API calls
- ตรวจสอบ timeout settings
- ใช้ connection pooling

### 3. Monitoring

- ตั้งค่า logging ที่เหมาะสม
- ตรวจสอบ error rates
- ตั้งค่า alerts สำหรับ critical errors

## ติดต่อ Support

หากยังมีปัญหา ให้ตรวจสอบ:

1. [LINE Developers Documentation](https://developers.line.biz/docs/)
2. [NextAuth.js Documentation](https://next-auth.js.org/)
3. [Docker Documentation](https://docs.docker.com/)

หรือติดต่อทีมพัฒนาเพื่อขอความช่วยเหลือเพิ่มเติม 