# การแก้ไขปัญหา LINE OAuth Authentication

## ปัญหาที่พบ
- LINE OAuth timeout error หลังจาก 15 วินาที
- การเชื่อมต่อกับ LINE API มีปัญหา
- Environment variables อาจไม่ถูกตั้งค่าถูกต้อง
- Build error เนื่องจาก useSearchParams() ไม่ได้ถูก wrap ใน Suspense boundary

## การแก้ไขที่ทำ

### 1. ปรับปรุง NextAuth Configuration
- ใช้การตั้งค่าเริ่มต้นของ NextAuth สำหรับ LINE (ลบ custom configuration)
- ปิด debug mode ใน production
- เพิ่ม error handling ที่ดีขึ้น
- ปรับปรุง logging ให้กระชับขึ้น

### 2. ปรับปรุง Docker Configuration
- เพิ่ม `NODE_TLS_REJECT_UNAUTHORIZED=0` เพื่อแก้ปัญหา SSL
- เพิ่ม extra_hosts สำหรับ LINE domains (หลาย IP)
- ปรับปรุง DNS settings (เพิ่ม 1.1.1.1)
- เพิ่ม TCP connection settings

### 3. สร้าง Error Page
- สร้างหน้าแสดงข้อผิดพลาดที่เข้าใจง่าย
- แสดงข้อความภาษาไทย
- มีปุ่มกลับไปหน้า login และหน้าหลัก
- **แก้ไขปัญหา Suspense boundary** โดย wrap useSearchParams ใน Suspense

### 4. สร้าง Diagnostic Scripts
- `check-line-connection.sh` - ตรวจสอบการเชื่อมต่อ LINE
- `fix-line-oauth.sh` - แก้ไขปัญหาแบบครบวงจร

## วิธีใช้งาน

### วิธีที่ 1: ใช้ Script แก้ไขปัญหา (แนะนำ)
```bash
chmod +x fix-line-oauth.sh
./fix-line-oauth.sh
```

### วิธีที่ 2: ตรวจสอบการเชื่อมต่อ
```bash
chmod +x check-line-connection.sh
./check-line-connection.sh
```

### วิธีที่ 3: ทำด้วยตัวเอง
```bash
# หยุด containers
docker-compose down

# ลบ frontend image
docker rmi thaihand-frontend

# ล้าง cache
docker system prune -f

# Rebuild และ start
docker-compose up --build -d

# ตรวจสอบ logs
docker-compose logs frontend --tail=30
```

## การตรวจสอบ

### ตรวจสอบ Environment Variables
```bash
docker-compose exec frontend env | grep -E "LINE_|NEXTAUTH_"
```

### ตรวจสอบ Logs
```bash
docker-compose logs frontend | grep -i "line\|auth\|error"
```

### ตรวจสอบ Network Connectivity
```bash
docker-compose exec frontend ping access.line.me
docker-compose exec frontend ping api.line.me
```

### ตรวจสอบ HTTP Connectivity
```bash
docker-compose exec frontend curl -I https://access.line.me
docker-compose exec frontend curl -I https://api.line.me
```

## Troubleshooting

### ถ้ายังมีปัญหา timeout
1. ตรวจสอบ LINE Client ID และ Secret ใน .env
2. ตรวจสอบ Callback URL ใน LINE Developer Console
3. ตรวจสอบ Network connectivity ด้วย `./check-line-connection.sh`

### ถ้ามีปัญหา SSL
1. ตรวจสอบ `NODE_TLS_REJECT_UNAUTHORIZED=0` ใน docker-compose.yml
2. ตรวจสอบ SSL certificates

### ถ้ามีปัญหา DNS
1. ตรวจสอบ DNS settings ใน docker-compose.yml
2. ตรวจสอบ extra_hosts configuration
3. ลองเพิ่ม DNS server อื่น

### ถ้ามีปัญหา Build Error
1. ตรวจสอบว่า useSearchParams ถูก wrap ใน Suspense boundary
2. ตรวจสอบว่า error page ถูกสร้างอย่างถูกต้อง

## หมายเหตุ
- การตั้งค่า `NODE_TLS_REJECT_UNAUTHORIZED=0` อาจทำให้ไม่ปลอดภัย ควรใช้เฉพาะใน development หรือเมื่อจำเป็น
- ควรตรวจสอบ LINE Developer Console ว่าการตั้งค่า OAuth ถูกต้อง
- ควรตรวจสอบ Callback URL ว่าเป็น `https://thaihand.shop/api/auth/callback/line`
- **สำคัญ**: useSearchParams() ต้องถูก wrap ใน Suspense boundary ใน Next.js 14
- **ใหม่**: ใช้การตั้งค่าเริ่มต้นของ NextAuth สำหรับ LINE เพื่อลดปัญหา 