"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RequestGrid from "@/components/RequestGrid";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function MyOrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken && session?.user?.email) {
      console.log('Fetching orders for email:', session.user.email);
      console.log('Session token exists:', !!session.accessToken);
      
      fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/my-orders?email=${session.user.email}`, {
        headers: { "Authorization": `Bearer ${session.accessToken}` }
      })
        .then(async (res) => {
          console.log('Response status:', res.status);
          console.log('Response headers:', Object.fromEntries(res.headers.entries()));
          
          if (!res.ok) {
            const errorData = await res.json();
            console.error('API Error:', errorData);
            throw new Error(errorData.detail || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
          }
          return res.json();
        })
        .then((data) => {
          console.log('my-orders', data);
          if (Array.isArray(data)) {
            setOrders(data);
          } else {
            console.error('API response ไม่ใช่ array', data);
            setOrders([]);
          }
        })
        .catch((error) => {
          console.error('Error fetching orders:', error);
          toast.error('ไม่สามารถดึงข้อมูลได้');
          setOrders([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.log('No session or email available');
      setLoading(false);
    }
  }, [session]);

  const handleView = (id: number) => {
    router.push(`/request/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/request/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!session?.accessToken) {
      toast.error('กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/requests/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.accessToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }

      toast.success('ลบข้อมูลสำเร็จ!');
      // รีเฟรชข้อมูล
      setOrders(orders.filter(order => order.id !== id));
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  const handleContact = (id: number) => {
    // TODO: เพิ่มฟีเจอร์ติดต่อ
    toast.info('ฟีเจอร์ติดต่อจะเปิดใช้งานเร็วๆ นี้');
  };

  const handleBookmark = (id: number) => {
    // TODO: เพิ่มฟีเจอร์ bookmark
    toast.info('ฟีเจอร์บันทึกรายการโปรดจะเปิดใช้งานเร็วๆ นี้');
  };

  const handleShare = (id: number) => {
    // TODO: เพิ่มฟีเจอร์แชร์
    toast.info('ฟีเจอร์แชร์จะเปิดใช้งานเร็วๆ นี้');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span>กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-8 text-center">งานของฉัน</h1>
          <div className="text-center py-20 text-gray-400">
            <span className="text-6xl mb-4 block">📦</span>
            <div className="text-xl mb-2">ยังไม่มีงาน</div>
            <div className="text-sm">เมื่อคุณสร้างงาน ข้อมูลจะแสดงที่นี่</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">งานของฉัน</h1>
        
        <RequestGrid
          requests={orders}
          mode="edit"
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onContact={handleContact}
          onBookmark={handleBookmark}
          onShare={handleShare}
          showFilters={true}
          showSearch={true}
          showSort={true}
          showViewToggle={true}
        />
      </div>
    </div>
  );
} 