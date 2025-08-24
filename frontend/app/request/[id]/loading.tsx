import { Loader2, Package } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <Package className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">กำลังโหลดข้อมูลคำขอ</h3>
        <p className="text-gray-500">กรุณารอสักครู่...</p>
      </div>
    </div>
  );
} 