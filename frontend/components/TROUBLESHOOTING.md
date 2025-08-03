# การแก้ไขปัญหา (Troubleshooting)

## ปัญหาที่พบและวิธีแก้ไข

### 1. API Error 500 - `/api/my-orders`

**ปัญหา:** เกิด Internal Server Error เมื่อเรียก API `/my-orders`

**สาเหตุ:** 
- `user_id` ที่ส่งมาจาก frontend เป็น string แต่ backend คาดหวัง int
- Session undefined หรือไม่สมบูรณ์

**วิธีแก้ไข:**
```python
# ใน backend/routers.py
@router.get("/my-orders", response_model=list[schemas.RequestOut])
def my_orders(email: str, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return []
        
        # แปลง user.id เป็น int ถ้าเป็น string
        user_id = int(user.id) if isinstance(user.id, str) else user.id
        result = crud.get_my_orders(db, user_id)
        return result
    except Exception as e:
        print(f"Error in my_orders: {e}")
        raise HTTPException(status_code=500, detail="เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์")
```

### 2. Session undefined

**ปัญหา:** Session เป็น undefined หรือไม่สมบูรณ์

**สาเหตุ:**
- Session ยังไม่โหลดเสร็จ
- การจัดการ session ไม่ถูกต้อง

**วิธีแก้ไข:**
```typescript
// ใน frontend/lib/useBackendToken.ts
export function useBackendToken() {
  const { data: session, status } = useSession();
  
  useEffect(() => {
    // รอให้ session โหลดเสร็จ
    if (status === "loading") {
      return;
    }

    // ถ้าไม่มี session ให้ reset token
    if (!session) {
      setBackendToken(null);
      setError(null);
      return;
    }
    // ... rest of the code
  }, [session, status, backendToken]);
}
```

### 3. 404 Error - `/offer/[id]/edit`

**ปัญหา:** ไม่พบหน้า edit offer

**สาเหตุ:** ไฟล์หน้า edit ไม่มีอยู่

**วิธีแก้ไข:** สร้างไฟล์ `frontend/app/offer/[id]/edit.tsx`

### 4. API response ไม่ใช่ array

**ปัญหา:** Backend ส่งข้อมูลผิดรูปแบบ

**วิธีแก้ไข:**
```typescript
// ใน frontend
.then((data) => {
  console.log('API response:', data);
  if (Array.isArray(data)) {
    setData(data);
  } else {
    console.error('API response ไม่ใช่ array', data);
    setData([]);
  }
})
```

### 5. การจัดการ Error

**วิธีที่ดีในการจัดการ Error:**

```typescript
// 1. ตรวจสอบ response status
.then(async (res) => {
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
  }
  return res.json();
})

// 2. ใช้ try-catch
.catch((error) => {
  console.error('Error:', error);
  toast.error('ไม่สามารถดึงข้อมูลได้');
  setData([]);
})
```

### 6. การ Debug

**วิธี Debug ที่แนะนำ:**

```typescript
// 1. Log session data
console.log('SESSION_USER', session?.user);
console.log('myUserId', (session as any)?.user?.id);

// 2. Log API response
console.log('API response:', data);

// 3. Log error details
console.error('Error details:', error);
```

### 7. การจัดการ Loading State

**วิธีที่ดีในการจัดการ Loading:**

```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  // ... fetch data
  .finally(() => {
    setLoading(false);
  });
}, [dependencies]);

if (loading) {
  return <LoadingSpinner />;
}
```

### 8. การจัดการ Empty State

**วิธีที่ดีในการจัดการ Empty State:**

```typescript
if (data.length === 0) {
  return (
    <div className="text-center py-20">
      <span className="text-6xl mb-4 block">📦</span>
      <div className="text-xl mb-2">ยังไม่มีข้อมูล</div>
      <div className="text-sm">เมื่อมีข้อมูลจะแสดงที่นี่</div>
    </div>
  );
}
```

## การป้องกันปัญหาในอนาคต

### 1. Type Safety
```typescript
interface Request {
  id: number;
  title: string;
  // ... other fields
}
```

### 2. Error Boundaries
```typescript
// สร้าง Error Boundary component
class ErrorBoundary extends React.Component {
  // ... implementation
}
```

### 3. Validation
```typescript
// ตรวจสอบข้อมูลก่อนใช้งาน
function validateRequest(data: any): data is Request {
  return data && typeof data.id === 'number' && typeof data.title === 'string';
}
```

### 4. Logging
```typescript
// ใช้ logging service
console.log('DEBUG:', { user: session?.user, data: response });
```

## คำแนะนำเพิ่มเติม

1. **ใช้ TypeScript** - ช่วยป้องกัน type errors
2. **เขียน Unit Tests** - ช่วยป้องกัน regression
3. **ใช้ Error Boundaries** - จัดการ error ที่ไม่คาดคิด
4. **Log อย่างเหมาะสม** - ช่วยในการ debug
5. **จัดการ Loading State** - ปรับปรุง UX
6. **จัดการ Empty State** - ปรับปรุง UX
7. **Validate ข้อมูล** - ป้องกัน runtime errors
8. **ใช้ Environment Variables** - แยก configuration 