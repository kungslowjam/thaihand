"use client";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane, User, Calendar, BadgeDollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CarryOrderDetailPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-10 px-2">
      <div className="max-w-2xl mx-auto">
        <Link href="/my-carry-orders" className="inline-flex items-center gap-2 text-blue-500 hover:underline mb-4">
          <ArrowLeft className="h-5 w-5" /> กลับไปยังรอบเดินทางของฉัน
        </Link>
        <Card className="mb-6 bg-white/90 shadow-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Plane className="h-5 w-5 text-blue-400" /> ระบบกำลังพัฒนา
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
              <span><Calendar className="inline h-4 w-4 mr-1" />ข้อมูลจะแสดงที่นี่</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">ออเดอร์ในรอบนี้</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
              <span className="text-5xl mb-2">📦</span>
              <div className="text-gray-400 mb-2">ระบบกำลังพัฒนา</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 