"use client";
import { useState } from "react";
import { LogOut, ShoppingBag, CheckCircle, Star, KeyRound, Settings, Clock, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimpleNavigation } from "@/components/simple-navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

const mockRequests = [
  { id: 1, title: "ขนมญี่ปุ่น", status: "รอรับหิ้ว", date: "2024-07-10" },
  { id: 2, title: "วิตามินออสเตรเลีย", status: "สำเร็จ", date: "2024-07-01" },
];
const mockOffers = [
  { id: 1, route: "Melbourne → BKK", status: "เปิดรับฝาก", date: "2024-07-15" },
  { id: 2, route: "BKK → Tokyo", status: "ปิดรับฝาก", date: "2024-06-20" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  console.log("session", session); // debug ดูค่า session
  const [tab, setTab] = useState<"requests" | "offers" | "activity">("requests");
  const [showDelete, setShowDelete] = useState<{ type: "request" | "offer"; id: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // mock delete handler
  function handleDelete() {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      setShowDelete(null);
      // TODO: remove from state
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-white">
      <SimpleNavigation
        user={session?.user ? { name: session.user.name ?? "", avatar: session.user.image ?? undefined } : undefined}
        onLogout={() => signOut()}
      />
      <div className="container mx-auto px-4 py-10 max-w-2xl flex flex-col items-center">
        {/* 1. เพิ่ม section สถิติ (mock) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-in">
          <div className="bg-white/70 rounded-2xl p-4 flex flex-col items-center shadow border border-white/30">
            <ShoppingBag className="h-6 w-6 text-blue-400 mb-1" />
            <div className="text-xl font-bold text-gray-800">2</div>
            <div className="text-xs text-gray-500">ฝากหิ้ว</div>
          </div>
          <div className="bg-white/70 rounded-2xl p-4 flex flex-col items-center shadow border border-white/30">
            <CheckCircle className="h-6 w-6 text-green-400 mb-1" />
            <div className="text-xl font-bold text-gray-800">2</div>
            <div className="text-xs text-gray-500">รับหิ้ว</div>
          </div>
          <div className="bg-white/70 rounded-2xl p-4 flex flex-col items-center shadow border border-white/30">
            <Star className="h-6 w-6 text-yellow-400 mb-1 animate-bounce" />
            <div className="text-xl font-bold text-gray-800">5.0</div>
            <div className="text-xs text-gray-500">รีวิว</div>
          </div>
        </div>
        {/* Profile Card ปรับตำแหน่งปุ่มและดีไซน์ใหม่ */}
        <div className="w-full bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 p-8 flex flex-col items-center mb-6 transition-all duration-300 hover:shadow-3xl relative overflow-hidden animate-fade-in">
          {/* floating gradient shape */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-blue-200/40 via-indigo-200/30 to-pink-200/20 rounded-full blur-3xl z-0 animate-float" />
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-10 bg-gradient-to-r from-blue-100/40 to-pink-100/30 rounded-full blur-2xl z-0 animate-float-slow" />
          {/* ปุ่มแก้ไขโปรไฟล์ floating action (desktop) */}
          <div className="hidden md:block absolute top-5 right-5 z-20">
            <Button size="icon" className="bg-gradient-to-r from-blue-400 via-indigo-400 to-pink-400 text-white shadow-lg hover:scale-110 transition" title="แก้ไขโปรไฟล์">
              <Edit2 className="h-5 w-5" />
            </Button>
          </div>
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "User"}
              width={112}
              height={112}
              className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-lg mb-4 z-10 ring-2 ring-blue-200/40 hover:scale-105 transition-transform duration-200"
              style={{ background: "#fff" }}
              onError={(e) => { e.currentTarget.src = "/thaihand-logo.png"; }}
              priority
            />
          ) : (
            <Image
              src="/thaihand-logo.png"
              alt="ThaiHand Logo"
              width={112}
              height={112}
              className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-lg mb-4 z-10 ring-2 ring-blue-200/40 hover:scale-105 transition-transform duration-200"
              style={{ background: "#fff" }}
              priority
            />
          )}
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1 z-10 flex items-center gap-2 tracking-tight">
            {session?.user?.name ?? "-"}
            <Badge className="bg-gradient-to-r from-indigo-400 via-blue-400 to-pink-400 text-white px-3 py-1 text-xs rounded-full ml-2 flex items-center gap-1 shadow animate-bounce">
              <span className="text-lg">🔥</span> มือใหม่ไฟแรง
            </Badge>
          </h2>
          {/* badge บัญชีผู้ใช้ */}
          <Badge className="bg-green-100 text-green-700 mb-2 px-2 py-0.5 text-xs rounded-full z-10 shadow">{session?.user?.email?.includes("@gmail") ? "Google" : session?.user?.email?.includes("@line") ? "Line" : "บัญชีผู้ใช้"}</Badge>
          <p className="text-gray-400 mb-2 z-10 text-sm font-mono">{session?.user?.email ?? "-"}</p>
          {/* ปุ่มแก้ไขโปรไฟล์ (mobile) */}
          <div className="flex md:hidden gap-2 mb-2 z-10">
            <Button size="lg" variant="default" className="rounded-xl px-7 font-bold shadow-lg bg-gradient-to-r from-blue-400 via-indigo-400 to-pink-400 text-white hover:scale-105 hover:shadow-xl transition flex items-center gap-2 text-base">
              <Edit2 className="h-5 w-5" /> แก้ไขโปรไฟล์
            </Button>
          </div>
          {/* ปุ่มลัด modern */}
          <div className="flex gap-4 mt-2 z-10 justify-center">
            <Button variant="ghost" className="flex flex-col items-center justify-center gap-1 rounded-2xl p-4 shadow-md hover:bg-indigo-50/60 transition group">
              <Settings className="h-6 w-6 text-indigo-400 group-hover:scale-110 transition" />
              <span className="text-xs text-gray-600 font-semibold mt-1">ตั้งค่าบัญชี</span>
            </Button>
          </div>
        </div>
        {/* ปุ่ม 'รายการของฉัน' อยู่ชิด section โปรไฟล์, gradient เด่น, ขนาดใหญ่ขึ้น */}
        <div className="w-full flex justify-center mb-8 animate-fade-in">
          <Link href="/dashboard/items">
            <Button size="lg" className="rounded-2xl px-10 py-4 font-bold text-lg shadow-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-400 text-white hover:scale-105 hover:shadow-2xl transition flex items-center gap-3">
              <ShoppingBag className="h-6 w-6" /> รายการของฉัน
            </Button>
          </Link>
        </div>

        {/* Tab Content: เหลือแค่กิจกรรมล่าสุด */}
        <div className="w-full">
          <div className="bg-white/80 rounded-xl p-5 shadow text-gray-600 flex items-center gap-3 justify-center min-h-[120px] animate-fade-in">
            <Clock className="h-5 w-5 text-indigo-400" />
            <span>ยังไม่มีกิจกรรมล่าสุด</span>
          </div>
        </div>

        {/* Modal ยืนยันลบ */}
        {showDelete && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xs w-full text-center border-t-4 border-red-200 animate-fade-in">
              <Trash2 className="h-10 w-10 text-red-300 mx-auto mb-2 animate-bounce" />
              <div className="text-lg font-semibold mb-2">ยืนยันการลบรายการนี้?</div>
              <div className="text-gray-400 mb-4 text-sm">การลบนี้ไม่สามารถย้อนกลับได้</div>
              <div className="flex gap-2 justify-center mt-4">
                <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="px-6">
                  {deleting && <span className="animate-spin mr-2">⏳</span>} ยืนยัน
                </Button>
                <Button variant="outline" onClick={() => setShowDelete(null)} disabled={deleting} className="px-6">ยกเลิก</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
