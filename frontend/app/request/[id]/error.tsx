'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-6">ไม่สามารถโหลดข้อมูลคำขอได้ กรุณาลองใหม่อีกครั้ง</p>
          
          <div className="space-y-3">
            <Button 
              onClick={reset}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              ลองใหม่
            </Button>
            
            <Link href="/dashboard">
              <Button 
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                <Home className="h-4 w-4 mr-2" />
                กลับหน้าหลัก
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 