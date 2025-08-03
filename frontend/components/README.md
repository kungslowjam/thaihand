# Request Components

คอมโพเนนต์สำหรับจัดการและแสดงผลคำขอฝากหิ้ว/รับหิ้ว

## RequestCard

คอมโพเนนต์การ์ดสำหรับแสดงข้อมูลคำขอแต่ละรายการ

### Props

```typescript
interface RequestCardProps {
  request: {
    id: number;
    title: string;
    from_location: string;
    to_location: string;
    deadline: string;
    close_date?: string;
    budget: number;
    description: string;
    image?: string;
    status: string;
    user?: string;
    user_email?: string;
    user_image?: string;
    carrier_name?: string;
    carrier_email?: string;
    carrier_phone?: string;
    carrier_image?: string;
    offer_id?: number;
    source?: string;
    created_at?: string;
    updated_at?: string;
    urgent?: boolean;
    weight?: number;
    amount?: number;
    note?: string;
    payment_status?: string;
    shipping_status?: string;
    rating?: number;
    review_count?: number;
  };
  mode?: 'view' | 'edit' | 'manage';
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onContact?: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onBookmark?: (id: number) => void;
  onShare?: (id: number) => void;
  isBookmarked?: boolean;
  showActions?: boolean;
}
```

### การใช้งาน

```tsx
import RequestCard from '@/components/RequestCard';

<RequestCard
  request={requestData}
  mode="view"
  onView={(id) => console.log('View request:', id)}
  onContact={(id) => console.log('Contact request:', id)}
  onBookmark={(id) => console.log('Bookmark request:', id)}
  isBookmarked={false}
/>
```

## RequestGrid

คอมโพเนนต์กริดสำหรับแสดงรายการคำขอพร้อมฟีเจอร์การค้นหา กรอง และเรียงลำดับ

### Props

```typescript
interface RequestGridProps {
  requests: Request[];
  mode?: 'view' | 'edit' | 'manage';
  loading?: boolean;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onContact?: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onBookmark?: (id: number) => void;
  onShare?: (id: number) => void;
  bookmarkedIds?: number[];
  showFilters?: boolean;
  showSearch?: boolean;
  showSort?: boolean;
  showViewToggle?: boolean;
}
```

### การใช้งาน

```tsx
import RequestGrid from '@/components/RequestGrid';

<RequestGrid
  requests={requestsData}
  mode="view"
  loading={false}
  onView={(id) => console.log('View request:', id)}
  onContact={(id) => console.log('Contact request:', id)}
  onBookmark={(id) => console.log('Bookmark request:', id)}
  bookmarkedIds={[1, 2, 3]}
  showFilters={true}
  showSearch={true}
  showSort={true}
  showViewToggle={true}
/>
```

## RequestDetailModal

คอมโพเนนต์โมดัลสำหรับแสดงรายละเอียดคำขอแบบเต็ม

### Props

```typescript
interface RequestDetailModalProps {
  open: boolean;
  onClose: () => void;
  request: Request | null;
  mode?: 'view' | 'edit' | 'manage';
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onContact?: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onBookmark?: (id: number) => void;
  onShare?: (id: number) => void;
  isBookmarked?: boolean;
}
```

### การใช้งาน

```tsx
import RequestDetailModal from '@/components/RequestDetailModal';

<RequestDetailModal
  open={showModal}
  onClose={() => setShowModal(false)}
  request={selectedRequest}
  mode="view"
  onContact={(id) => console.log('Contact request:', id)}
  onBookmark={(id) => console.log('Bookmark request:', id)}
  isBookmarked={false}
/>
```

## RequestStats

คอมโพเนนต์สำหรับแสดงสถิติของคำขอ

### Props

```typescript
interface RequestStatsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
    cancelled: number;
    totalBudget: number;
    averageBudget: number;
    urgentCount: number;
    activeUsers: number;
    thisMonth: number;
    lastMonth: number;
  };
  loading?: boolean;
}
```

### การใช้งาน

```tsx
import RequestStats from '@/components/RequestStats';

<RequestStats
  stats={statsData}
  loading={false}
/>
```

## ฟีเจอร์ที่เพิ่มเข้ามา

### 1. ข้อมูลผู้ใช้ (User Information)
- รูปโปรไฟล์ผู้ฝาก/รับหิ้ว
- ชื่อผู้ใช้ที่แสดงผล
- Rating/Review ของผู้ใช้
- สถานะการยืนยันตัวตน

### 2. ข้อมูลสถานะ (Status Information)
- สถานะการดำเนินการที่ชัดเจน
- Progress bar แสดงความคืบหน้า
- วันที่อัปเดตล่าสุด

### 3. ข้อมูลการติดต่อ (Contact Information)
- ข้อมูลการติดต่อที่ครบถ้วน
- ปุ่มติดต่อที่ใช้งานได้จริง
- ระบบแชทในแอป

### 4. ข้อมูลสินค้า (Product Information)
- รายละเอียดสินค้าที่ครบถ้วน
- ภาพสินค้าที่ชัดเจน
- ข้อมูลน้ำหนักและขนาด

### 5. ข้อมูลการชำระเงิน (Payment Information)
- ราคาที่ชัดเจน
- วิธีการชำระเงิน
- สถานะการชำระเงิน

### 6. ข้อมูลการจัดส่ง (Shipping Information)
- จุดนัดรับ/ส่งที่ชัดเจน
- วันที่และเวลานัดหมาย
- การติดตามสถานะการจัดส่ง

### 7. ฟีเจอร์เพิ่มเติม
- ระบบ Bookmark/รายการโปรด
- ระบบแชร์
- การค้นหาและกรอง
- การเรียงลำดับ
- สลับมุมมอง Grid/List
- สถิติและรายงาน

## การปรับปรุงที่ทำ

1. **UI/UX ที่ดีขึ้น**
   - การ์ดที่มีการออกแบบที่สวยงาม
   - เอฟเฟกต์ hover และ transition
   - การแสดงผลที่ responsive

2. **ข้อมูลที่ครบถ้วน**
   - ข้อมูลผู้ใช้
   - สถานะการดำเนินการ
   - ข้อมูลการชำระเงินและจัดส่ง

3. **ฟีเจอร์ที่ใช้งานได้จริง**
   - ระบบ Bookmark
   - การแชร์
   - การค้นหาและกรอง
   - การเรียงลำดับ

4. **การจัดการสถานะ**
   - สถานะคำขอที่ชัดเจน
   - การแสดงความคืบหน้า
   - การแจ้งเตือน

5. **การแสดงผลที่ยืดหยุ่น**
   - โหมดการแสดงผลหลายแบบ
   - การปรับแต่งตามความต้องการ
   - การรองรับข้อมูลที่หลากหลาย 