"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MyOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (session?.accessToken && session?.user?.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/my-orders?user_id=${session.user.id}`, {
        headers: { "Authorization": `Bearer ${session.accessToken}` }
      })
        .then(res => res.json())
        .then(setOrders)
        .catch(() => setOrders([]));
    }
  }, [session]);

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">งานของฉัน</h1>
        <div className="text-center py-20 text-gray-400">
          <span className="text-5xl mb-4 block">📦</span>
          <div className="text-lg mb-2">ยังไม่มีงาน</div>
          <div className="text-sm">เมื่อคุณสร้างงาน ข้อมูลจะแสดงที่นี่</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">งานของฉัน</h1>
        <div className="space-y-3">
          {orders.map(order => (
            <Card key={order.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-semibold">{order.title}</div>
                <div className="text-xs text-gray-500">สถานะ: {order.status}</div>
              </div>
              <div className="text-right">
                <div className="text-green-700 font-bold">{order.budget} บาท</div>
                <Button size="sm" variant="outline">ดูรายละเอียด</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
} 