"use client";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane, User, Calendar, BadgeDollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { mockFlights } from "@/lib/mockData";

export default function CarryOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const flight = mockFlights.find(f => f.id === params.id);

  if (!flight) return <div className="text-center py-20 text-gray-400">ไม่พบข้อมูลเที่ยวบิน</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-10 px-2">
      <div className="max-w-2xl mx-auto">
        <Link href="/my-carry-orders" className="inline-flex items-center gap-2 text-blue-500 hover:underline mb-4">
          <ArrowLeft className="h-5 w-5" /> กลับไปยังรอบเดินทางของฉัน
        </Link>
        <Card className="mb-6 bg-white/90 shadow-xl overflow-hidden">
          <img src={flight.image} alt={flight.from + ' to ' + flight.to} className="w-full h-40 object-cover" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Plane className="h-5 w-5 text-blue-400" /> {flight.from} → {flight.to}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
              <span><Calendar className="inline h-4 w-4 mr-1" />บิน {flight.departDate}</span>
              <span>• ปิดรับ {flight.closeDate}</span>
              <span><BadgeDollarSign className="inline h-4 w-4 mr-1 text-blue-500" />{flight.price.toLocaleString()} บาท/{flight.unit}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <User className="h-6 w-6 text-gray-400 bg-gray-100 rounded-full p-1" />
              <span className="font-semibold text-gray-700">{flight.user.name}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">ออเดอร์ในรอบนี้</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {flight.orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
                <span className="text-5xl mb-2">📦</span>
                <div className="text-gray-400 mb-2">ยังไม่มีออเดอร์ในรอบนี้</div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {flight.orders.map(order => (
                  <div key={order.id} className="flex items-center justify-between px-4 py-3 hover:bg-blue-50/60 transition">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{order.item}</span>
                      <span className="text-xs text-gray-500">น้ำหนัก: {order.weight} กก. | ค่าหิ้ว: {order.fee.toLocaleString()} บาท</span>
                      <Badge variant={order.status === 'สำเร็จ' ? 'secondary' : 'default'} className="mt-1 w-fit">{order.status}</Badge>
                    </div>
                    {/* เพิ่มปุ่ม action ได้ตามต้องการ */}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 