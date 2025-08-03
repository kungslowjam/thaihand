"use client";
import { useState, useEffect } from "react";
import { LogOut, ShoppingBag, CheckCircle, Star, KeyRound, Settings, Clock, Edit2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useUserStore } from '@/store/userStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useBackendToken } from '@/lib/useBackendToken';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { data: session } = useSession();
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);
  const [tab, setTab] = useState<"requests" | "offers" | "activity">("requests");
  const [showDelete, setShowDelete] = useState<{ type: "request" | "offer"; id: number } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { backendToken, loading: tokenLoading } = useBackendToken();
  
  // สถิติจาก backend
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalOffers: 0,
    totalEarnings: 0,
    rating: 5.0
  });
  const [loading, setLoading] = useState(true);

  // sync session กับ userStore
  useEffect(() => {
    if (session?.user) {
      setUser({
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        image: session.user.image ?? undefined,
      });
    }
  }, [session, setUser]);

  // ดึงข้อมูลสถิติจาก backend
  useEffect(() => {
    if (!backendToken || !session?.user?.email) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // ดึงข้อมูล requests และ offers ของผู้ใช้
        const [requestsRes, offersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/my-orders?email=${session.user.email}`, {
            headers: { "Authorization": `Bearer ${backendToken}` }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/my-carry-orders?email=${session.user.email}`, {
            headers: { "Authorization": `Bearer ${backendToken}` }
          })
        ]);

        const requests = requestsRes.ok ? await requestsRes.json() : [];
        const offers = offersRes.ok ? await offersRes.json() : [];

        // คำนวณรายได้รวมจาก requests ที่อนุมัติแล้ว
        const totalEarnings = requests.reduce((sum: number, req: any) => {
          if (req.status === 'อนุมัติ' || req.status === 'สำเร็จ') {
            return sum + (parseInt(req.budget) || 0);
          }
          return sum;
        }, 0);

        setStats({
          totalRequests: requests.length,
          totalOffers: offers.length,
          totalEarnings: totalEarnings,
          rating: 5.0 // ยังไม่มีระบบ rating จริง
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('ไม่สามารถดึงข้อมูลสถิติได้');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [backendToken, session?.user?.email]);

  // mock delete handler
  async function handleDelete() {
    console.log("handleDelete - showDelete:", showDelete);
    console.log("handleDelete - backendToken:", backendToken);
    console.log("handleDelete - backendToken exists:", !!backendToken);
    
    if (!showDelete || !backendToken) {
      console.log("handleDelete - Cannot delete: showDelete or backendToken is null");
      return;
    }
    
    setDeleting(true);
    try {
      const endpoint = showDelete.type === 'request' ? 'requests' : 'offers';
      const url = `${process.env.NEXT_PUBLIC_API_URL || '/api'}/${endpoint}/${showDelete.id}`;
      console.log("handleDelete - URL:", url);
      console.log("handleDelete - Authorization header:", `Bearer ${backendToken.substring(0, 20)}...`);
      
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${backendToken}`
        }
      });

      if (response.ok) {
        toast.success('ลบข้อมูลสำเร็จ!');
        // รีเฟรชข้อมูลสถิติ
        window.location.reload();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setDeleting(false);
      setShowDelete(null);
    }
  }

  if (tokenLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-white flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-white">
      <div className="container mx-auto px-4 py-10 max-w-2xl flex flex-col items-center">
        {/* 1. เพิ่ม section สถิติ (ข้อมูลจริงจาก backend) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-in">
          <div className="bg-white/70 rounded-2xl p-4 flex flex-col items-center shadow border border-white/30">
            <ShoppingBag className="h-6 w-6 text-blue-400 mb-1" />
            <div className="text-xl font-bold text-gray-800">{stats.totalRequests}</div>
            <div className="text-xs text-gray-500">ฝากหิ้ว</div>
          </div>
          <div className="bg-white/70 rounded-2xl p-4 flex flex-col items-center shadow border border-white/30">
            <CheckCircle className="h-6 w-6 text-green-400 mb-1" />
            <div className="text-xl font-bold text-gray-800">{stats.totalOffers}</div>
            <div className="text-xs text-gray-500">รับหิ้ว</div>
          </div>
          <div className="bg-white/70 rounded-2xl p-4 flex flex-col items-center shadow border border-white/30">
            <Star className="h-6 w-6 text-yellow-400 mb-1 animate-bounce" />
            <div className="text-xl font-bold text-gray-800">฿{stats.totalEarnings.toLocaleString()}</div>
            <div className="text-xs text-gray-500">รายได้รวม</div>
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
