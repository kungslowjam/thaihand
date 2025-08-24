import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Home, Package } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200">
          <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Search className="h-8 w-8 text-yellow-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">ไม่พบรายการ</h2>
          <p className="text-gray-600 mb-6">รายการที่คุณค้นหาไม่มีอยู่หรืออาจถูกลบไปแล้ว</p>
          
          <div className="space-y-3">
            <Link href="/dashboard">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200"
              >
                <Home className="h-4 w-4 mr-2" />
                กลับหน้าหลัก
              </Button>
            </Link>
            
            <Link href="/marketplace">
              <Button 
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                <Package className="h-4 w-4 mr-2" />
                ดูรายการอื่นๆ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 