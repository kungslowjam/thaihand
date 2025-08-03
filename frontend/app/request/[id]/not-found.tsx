import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบรายการ</h2>
        <p className="text-gray-600 mb-4">รายการที่คุณค้นหาไม่มีอยู่</p>
        <Link href="/dashboard">
          <Button>กลับไปหน้าแรก</Button>
        </Link>
      </div>
    </div>
  );
} 