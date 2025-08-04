'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane, User, Calendar, BadgeDollarSign, Star, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { Progress } from '@/components/progress';
export default function MyCarryOrdersPage() {
  const { data: session } = useSession();
  const [flights, setFlights] = useState<any[]>([]);

  useEffect(() => {
    if (session?.accessToken && session?.user?.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/my-carry-orders?user_id=${session.user.id}`, {
        headers: { "Authorization": `Bearer ${session.accessToken}` }
      })
        .then(res => res.json())
        .then(setFlights)
        .catch(() => setFlights([]));
    }
  }, [session]);

  if (flights.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-10 px-2">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-8 text-center tracking-tight flex items-center justify-center gap-2">
            <Plane className="h-7 w-7 text-blue-400" /> เที่ยวบิน/รอบเดินทางที่ฉันรับหิ้ว
          </h1>
          <div className="text-center py-20 text-gray-400">
            <span className="text-5xl mb-4 block">✈️</span>
            <div className="text-lg mb-2">ยังไม่มีรอบเดินทาง</div>
            <div className="text-sm">เมื่อคุณสร้างรอบเดินทาง ข้อมูลจะแสดงที่นี่</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-10 px-2">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-8 text-center tracking-tight flex items-center justify-center gap-2">
            <Plane className="h-7 w-7 text-blue-400" /> เที่ยวบิน/รอบเดินทางที่ฉันรับหิ้ว
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {flights.map(flight => {
              const maxWeight = flight?.maxWeight || 0;
              const usedWeight = flight?.usedWeight || 0;
              const remainingWeight = maxWeight - usedWeight;
              return (
                <Card key={flight.id} className="overflow-hidden bg-white/90 shadow-xl border-0">
                  <img src={flight.image} alt={flight.from + ' to ' + flight.to} className="w-full h-40 object-cover" />
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Plane className="h-5 w-5 text-blue-400" />
                      <span className="font-bold text-lg">{flight.from} → {flight.to}</span>
                      {flight.isHot && <Badge variant="default" className="bg-pink-200 text-pink-700 ml-2 flex items-center gap-1"><Star className="h-4 w-4 text-pink-500" /> ด่วน</Badge>}
                    </div>
                    <Badge variant="secondary" className="mb-2"><Plane className="h-4 w-4 inline mr-1" /> รับหิ้ว</Badge>
                    <div className="text-sm text-gray-600 mb-2 flex flex-wrap gap-2">
                      <span><Calendar className="inline h-4 w-4 mr-1" />บิน {flight.departDate}</span>
                      <span>• ปิดรับ {flight.closeDate}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <BadgeDollarSign className="h-5 w-5 text-blue-500" />
                      <span className="text-blue-700 font-bold text-lg">{flight.price?.toLocaleString()} บาท/{flight.unit}</span>
                      <Badge variant="outline" className="ml-2"><Plane className="h-4 w-4 inline mr-1" /> เปิดรับหิ้ว</Badge>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1 text-xs font-medium">
                        <span>น้ำหนักที่รับแล้ว</span>
                        <span>{usedWeight} / {maxWeight} กก.</span>
                      </div>
                      <Progress value={Math.min((usedWeight / maxWeight) * 100, 100)} className="h-4 bg-gray-200" />
                      <div className="flex justify-between items-center mt-1 text-xs">
                        <span className="text-gray-500 font-semibold">เหลือ {remainingWeight.toFixed(2)} กก.</span>
                      </div>
                      {usedWeight > maxWeight && (
                        <div className="text-xs text-red-500 mt-1 font-semibold">น้ำหนักเกินลิมิต!</div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2 text-xs">
                      <Badge variant="secondary">น้ำหนักสูงสุด {maxWeight} กก.</Badge>
                      <Badge variant="default">รับแล้ว {usedWeight} กก.</Badge>
                      <Badge variant={remainingWeight <= 0 ? 'destructive' : 'outline'}>เหลือ {remainingWeight} กก.</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2 text-xs">
                      <Badge variant="secondary">{flight.ordersCount || 0} ออเดอร์ในรอบนี้</Badge>
                    </div>
                    {flight.note && (
                      <div className="text-xs text-gray-500 mb-2">หมายเหตุ: {flight.note}</div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Link href={`/my-carry-orders/${flight.id}`} className="flex-1">
                        <button className="w-full rounded-xl border border-gray-200 py-2 font-semibold bg-white hover:bg-blue-50 transition">ดูรายละเอียด</button>
                      </Link>
                      <button className="rounded-xl border border-gray-200 py-2 px-4 font-semibold bg-white hover:bg-yellow-50 transition">แก้ไข</button>
                      <button className="rounded-xl border border-gray-200 py-2 px-4 font-semibold bg-white hover:bg-red-50 text-red-500 transition">ปิดรับ</button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
} 