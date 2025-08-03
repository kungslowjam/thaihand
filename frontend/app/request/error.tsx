'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">เกิดข้อผิดพลาด</h2>
        <p className="text-gray-600 mb-4">ไม่สามารถโหลดหน้าได้</p>
        <Button onClick={reset}>ลองใหม่</Button>
      </div>
    </div>
  );
} 