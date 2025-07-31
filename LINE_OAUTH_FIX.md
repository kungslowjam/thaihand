# การแก้ไขปัญหา LINE OAuth Authentication

## ปัญหาที่พบ
- LINE OAuth timeout error หลังจาก 15 วินาที
- การเชื่อมต่อกับ LINE API มีปัญหา
- Environment variables อาจไม่ถูกตั้งค่าถูกต้อง

## การแก้ไขที่ทำ

### 1. ปรับปรุง NextAuth Configuration
- เพิ่ม timeout เป็น 30 วินาที (จากเดิม 15 วินาที)
- ปิด debug mode ใน production
- เพิ่ม error handling ที่ดีขึ้น
- ปรับปรุง logging ให้กระชับขึ้น

### 2. ปรับปรุง Docker Configuration
- เพิ่ม `NODE_TLS_REJECT_UNAUTHORIZED=0` เพื่อแก้ปัญหา SSL
- เพิ่ม extra_hosts สำหรับ LINE domains
- ปรับปรุง DNS settings

### 3. สร้าง Error Page
- สร้างหน้าแสดงข้อผิดพลาดที่เข้าใจง่าย
- แสดงข้อความภาษาไทย
- มีปุ่มกลับไปหน้า login และหน้าหลัก

## วิธีใช้งาน

### วิธีที่ 1: ใช้ Script (แนะนำ)
```bash
chmod +x restart-auth-fix.sh
./restart-auth-fix.sh
```

### วิธีที่ 2: ทำด้วยตัวเอง
```bash
# หยุด containers
docker-compose down

# ลบ frontend image
docker rmi thaihand-frontend

# Rebuild และ start
docker-compose up --build -d

# ตรวจสอบ logs
docker-compose logs frontend --tail=20
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

## Troubleshooting

### ถ้ายังมีปัญหา timeout
1. ตรวจสอบ LINE Client ID และ Secret ใน .env
2. ตรวจสอบ Callback URL ใน LINE Developer Console
3. ตรวจสอบ Network connectivity

### ถ้ามีปัญหา SSL
1. ตรวจสอบ `NODE_TLS_REJECT_UNAUTHORIZED=0` ใน docker-compose.yml
2. ตรวจสอบ SSL certificates

### ถ้ามีปัญหา DNS
1. ตรวจสอบ DNS settings ใน docker-compose.yml
2. ตรวจสอบ extra_hosts configuration

## หมายเหตุ
- การตั้งค่า `NODE_TLS_REJECT_UNAUTHORIZED=0` อาจทำให้ไม่ปลอดภัย ควรใช้เฉพาะใน development หรือเมื่อจำเป็น
- ควรตรวจสอบ LINE Developer Console ว่าการตั้งค่า OAuth ถูกต้อง
- ควรตรวจสอบ Callback URL ว่าเป็น `https://thaihand.shop/api/auth/callback/line` 