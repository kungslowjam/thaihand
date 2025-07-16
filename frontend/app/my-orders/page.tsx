"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { myOrders } from "@/lib/mockData";

export default function MyOrdersPage() {
  const { data: session } = useSession();
  return (
    <>
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">งานของฉัน</h1>
        <div className="space-y-3">
          {myOrders.map(order => (
            <Card key={order.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-semibold">{order.item}</div>
                <div className="text-xs text-gray-500">สถานะ: {order.status}</div>
              </div>
              <div className="text-right">
                <div className="text-green-700 font-bold">{order.fee} บาท</div>
                <Button size="sm" variant="outline">ดูรายละเอียด</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
} 