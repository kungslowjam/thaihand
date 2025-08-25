"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { OfferForm } from "@/components/OfferForm";
import { useBackendToken } from "@/lib/useBackendToken";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plane, Plus, Trash2 } from "lucide-react";

interface Offer {
  id: number;
  route_from: string;
  route_to: string;
  flight_date: string;
  close_date: string;
  delivery_date: string;
  rates: string;
  pickup_place: string;
  description: string;
  contact: string;
  urgent: boolean;
  created_at: string;
}

export default function MyRoutesPage() {
  const { data: session } = useSession();
  const { backendToken, loading: tokenLoading } = useBackendToken();
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ดึงข้อมูลรอบเดินทางจาก API
  useEffect(() => {
    if (backendToken) {
      fetchOffers();
    }
  }, [backendToken]);

  async function fetchOffers() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers/my`, {
        headers: {
          "Authorization": `Bearer ${backendToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOffers(data);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลรอบเดินทาง');
    } finally {
      setLoading(false);
    }
  }

  async function handleOfferSubmit(data: any) {
    try {
      const payload = {
        route_from: data.routeFrom,
        route_to: data.routeTo,
        flight_date: data.flightDate,
        close_date: data.closeDate,
        delivery_date: data.deliveryDate,
        rates: JSON.stringify(data.rates ?? []),
        pickup_place: data.pickupPlace,
        item_types: JSON.stringify(data.itemTypes ?? []),
        restrictions: JSON.stringify(data.restrictions ?? []),
        description: data.description,
        contact: data.contact,
        urgent: data.urgent ? "true" : "false",
        image: data.image ?? null,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${backendToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'เกิดข้อผิดพลาดในการสร้างรอบเดินทาง');
      }

      toast.success("สร้างรอบเดินทางสำเร็จ!");
      setShowCreateForm(false);
      fetchOffers(); // รีเฟรชข้อมูล
    } catch (error: any) {
      console.error('Error creating offer:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการสร้างรอบเดินทาง');
    }
  }

  async function handleDeleteOffer(offerId: number) {
    if (!confirm('คุณต้องการลบรอบเดินทางนี้หรือไม่?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers/${offerId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${backendToken}`
        }
      });

      if (response.ok) {
        toast.success("ลบรอบเดินทางสำเร็จ!");
        fetchOffers(); // รีเฟรชข้อมูล
      } else {
        throw new Error('เกิดข้อผิดพลาดในการลบรอบเดินทาง');
      }
    } catch (error: any) {
      console.error('Error deleting offer:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการลบรอบเดินทาง');
    }
  }

  // แสดง loading state ขณะที่กำลังโหลด token
  if (tokenLoading) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span>กำลังโหลด...</span>
          </div>
          <p>กำลังเชื่อมต่อกับเซิร์ฟเวอร์</p>
        </Card>
      </div>
    );
  }

  // ตรวจสอบ session และ backendToken
  if (!session || !backendToken) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <Card className="p-6 text-center">
          <p>กรุณาเข้าสู่ระบบเพื่อดูรอบเดินทางของคุณ</p>
          {!session && <p className="text-sm text-gray-500 mt-2">ยังไม่ได้เข้าสู่ระบบ</p>}
          {session && !backendToken && <p className="text-sm text-gray-500 mt-2">ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้</p>}
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plane className="h-6 w-6 text-indigo-500" />
          รอบเดินทางของฉัน
        </h1>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-blue-400 via-indigo-400 to-pink-400 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มรอบเดินทาง
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">สร้างรอบเดินทางใหม่</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCreateForm(false)}
            >
              ยกเลิก
            </Button>
          </div>
          <OfferForm mode="create" onSubmit={handleOfferSubmit} />
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">รายการรอบเดินทาง</h2>
        
        {loading ? (
          <Card className="p-6 text-center">
            <p>กำลังโหลดข้อมูล...</p>
          </Card>
        ) : offers.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            <Plane className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>ยังไม่มีรอบเดินทาง</p>
            <p className="text-sm">คลิกปุ่ม "เพิ่มรอบเดินทาง" เพื่อสร้างรอบเดินทางแรกของคุณ</p>
          </Card>
        ) : (
          offers.map((offer) => (
            <Card key={offer.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold text-lg">
                    {offer.route_from} → {offer.route_to}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>วันบิน: {new Date(offer.flight_date).toLocaleDateString('th-TH')}</div>
                    <div>วันปิดรับฝาก: {new Date(offer.close_date).toLocaleDateString('th-TH')}</div>
                    <div>วันส่งของ: {new Date(offer.delivery_date).toLocaleDateString('th-TH')}</div>
                    <div>จุดนัดรับ: {offer.pickup_place}</div>
                    {offer.description && <div>รายละเอียด: {offer.description}</div>}
                    <div>ติดต่อ: {offer.contact}</div>
                    {offer.urgent && <div className="text-red-600 font-medium">ด่วน</div>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/my-routes/management/${offer.id}`)}
                  >
                    แก้ไข
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteOffer(offer.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 