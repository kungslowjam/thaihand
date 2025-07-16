"use client";
import { useSession, signOut } from "next-auth/react";
import { myOrders } from "@/lib/mockData";
const totalEarnings = myOrders.filter(o => o.status === "สำเร็จ").reduce((sum, o) => sum + o.fee, 0);
const pendingEarnings = myOrders.filter(o => o.status === "รอจ่าย").reduce((sum, o) => sum + o.fee, 0);

export default function EarningsPage() {
  const { data: session } = useSession();
  return (
    <>
      <div className="max-w-xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">สรุปรายได้</h1>
        <div className="mb-4">ยอดที่ได้รับแล้ว: <span className="text-green-700 font-bold">{totalEarnings} บาท</span></div>
        <div className="mb-4">ยอดที่รอจ่าย: <span className="text-yellow-700 font-bold">{pendingEarnings} บาท</span></div>
      </div>
    </>
  );
} 