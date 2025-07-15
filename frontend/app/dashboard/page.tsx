"use client";
import { LogOut, ShoppingBag, CheckCircle, Star, KeyRound, Settings, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimpleNavigation } from "@/components/simple-navigation";
import { useSession, signOut } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-white">
      <SimpleNavigation
        user={
          session?.user
            ? { name: session.user.name ?? "", avatar: session.user.image ?? undefined }
            : undefined
        }
        onLogout={() => signOut()}
      />

      <div className="container mx-auto px-4 py-10 max-w-lg flex flex-col items-center">
        {/* Profile Card */}
        <div className="w-full bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 flex flex-col items-center mb-10 transition-all duration-300 hover:shadow-3xl">
          <img
            src={session?.user?.image ?? "/thaihand-logo.png"}
            alt={session?.user?.name ?? "User"}
            className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-lg mb-4"
          />
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{session?.user?.name ?? "-"}</h2>
          <p className="text-gray-500 mb-2">{session?.user?.email ?? "-"}</p>
          <Badge className="bg-green-100 text-green-700 mb-4 px-3 py-1 text-sm rounded-full">
            {session?.user?.email?.includes("@gmail")
              ? "Google"
              : session?.user?.email?.includes("@line")
              ? "Line"
              : "บัญชีผู้ใช้"}
          </Badge>
          <div className="flex gap-3 mb-2">
            <Button size="sm" variant="default" className="rounded-lg px-5 font-semibold shadow hover:scale-105 transition">
              แก้ไขโปรไฟล์
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => signOut()}
              title="ออกจากระบบ"
              className="rounded-full hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 text-gray-400" />
            </Button>
          </div>
          {/* ปุ่มลัด */}
          <div className="flex gap-3 mt-2">
            <Button variant="outline" className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm hover:bg-blue-50 transition">
              <KeyRound className="h-4 w-4" /> เปลี่ยนรหัสผ่าน
            </Button>
            <Button variant="outline" className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-50 transition">
              <Settings className="h-4 w-4" /> ตั้งค่าบัญชี
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="w-full grid grid-cols-3 gap-4 mb-10">
          <div className="flex flex-col items-center bg-white/80 rounded-2xl p-5 shadow border border-white/30 hover:shadow-lg transition">
            <ShoppingBag className="h-7 w-7 text-blue-500 mb-1" />
            <span className="font-bold text-blue-700 text-xl">0</span>
            <span className="text-xs text-gray-500">ฝากซื้อ</span>
          </div>
          <div className="flex flex-col items-center bg-white/80 rounded-2xl p-5 shadow border border-white/30 hover:shadow-lg transition">
            <CheckCircle className="h-7 w-7 text-green-500 mb-1" />
            <span className="font-bold text-green-700 text-xl">0</span>
            <span className="text-xs text-gray-500">สำเร็จ</span>
          </div>
          <div className="flex flex-col items-center bg-white/80 rounded-2xl p-5 shadow border border-white/30 hover:shadow-lg transition">
            <Star className="h-7 w-7 text-yellow-400 mb-1" />
            <span className="font-bold text-yellow-600 text-xl">0</span>
            <span className="text-xs text-gray-500">คะแนน</span>
          </div>
        </div>

        {/* กิจกรรมล่าสุด */}
        <div className="w-full mt-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-400" /> กิจกรรมล่าสุด
          </h3>
          <div className="bg-white/80 rounded-xl p-5 shadow text-gray-600 flex items-center gap-3">
            <span className="text-2xl">🛒</span>
            <span>ยังไม่มีรายการฝากซื้อในช่วงนี้</span>
          </div>
        </div>
      </div>
    </div>
  );
}
