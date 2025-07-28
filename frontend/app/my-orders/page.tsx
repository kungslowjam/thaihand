"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MyOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (session?.accessToken && session?.user?.id) {
      fetch(`http://localhost:8000/api/my-orders?user_id=${session.user.id}`, {
        headers: { "Authorization": `Bearer ${session.accessToken}` }
      })
        .then(res => res.json())
        .then(setOrders);
    }
  }, [session]);

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