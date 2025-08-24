'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { useRouter, useParams } from 'next/navigation';
import RequestDetailModal from '../../../../components/RequestDetailModal';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import { useBackendToken } from "@/lib/useBackendToken";
import { ShoppingBag, Loader2, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { OfferForm } from '@/components/OfferForm';

const statusOptions = ['ทั้งหมด', 'รออนุมัติ', 'อนุมัติ', 'ปฏิเสธ', 'สำเร็จ'];

export default function ManagementPage() {
  const params = useParams();
  const routeId = params?.routeId;
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด');
  const [search, setSearch] = useState('');
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [offerData, setOfferData] = useState<any>(null);
  const { backendToken, loading: tokenLoading } = useBackendToken();

  // สรุปสถิติ
  const totalRequests = requests.length;
  const totalWeight = requests.reduce((sum, r) => sum + (parseFloat(r.weight) || 0), 0);
  const totalEarnings = requests.reduce((sum, r) => {
    if (r.status === 'อนุมัติ' || r.status === 'สำเร็จ') {
      return sum + (parseInt(r.budget) || 0);
    }
    return sum;
  }, 0);

  // Header summary (mock route info)
  const routeSummary = {
    routeFrom: requests[0]?.from_location || "-",
    routeTo: requests[0]?.to_location || "-",
    flightDate: requests[0]?.flight_date || requests[0]?.deadline || "-",
    closeDate: requests[0]?.close_date || requests[0]?.deadline || "-",
    totalWeight: requests.reduce((sum, r) => sum + (parseFloat(r.weight) || 0), 0),
    totalRequests: requests.length,
    totalEarnings: totalEarnings,
  };

  // ดึงข้อมูลรอบเดินทาง
  useEffect(() => {
    if (routeId && backendToken) {
      fetchOfferData();
    }
  }, [routeId, backendToken]);

  async function fetchOfferData() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers/${routeId}`, {
        headers: {
          "Authorization": `Bearer ${backendToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOfferData(data);
      }
    } catch (error) {
      console.error('Error fetching offer data:', error);
    }
  }

  // แก้ไขรอบเดินทาง
  async function handleEditOffer(data: any) {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers/${routeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${backendToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'เกิดข้อผิดพลาดในการแก้ไขรอบเดินทาง');
      }

      toast.success("แก้ไขรอบเดินทางสำเร็จ!");
      setShowEditForm(false);
      fetchOfferData(); // รีเฟรชข้อมูล
    } catch (error: any) {
      console.error('Error updating offer:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการแก้ไขรอบเดินทาง');
    }
  }

  // ลบรอบเดินทาง
  async function handleDeleteOffer() {
    if (!confirm('คุณต้องการลบรอบเดินทางนี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers/${routeId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${backendToken}`
        }
      });

      if (response.ok) {
        toast.success("ลบรอบเดินทางสำเร็จ!");
        router.push("/my-routes");
      } else {
        throw new Error('เกิดข้อผิดพลาดในการลบรอบเดินทาง');
      }
    } catch (error: any) {
      console.error('Error deleting offer:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการลบรอบเดินทาง');
    }
  }

  // Approve/Reject
  const handleApprove = async (requestId: number) => {
    if (!backendToken) {
      toast.error('กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/requests/${requestId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${backendToken}`
        },
        body: JSON.stringify({ status: "อนุมัติ" })
      });
      
      if (res.ok) {
        toast.success('อนุมัติคำขอสำเร็จ!');
        fetchRequests();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'เกิดข้อผิดพลาดในการอนุมัติ');
      }
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  const handleReject = async (requestId: number) => {
    if (!backendToken) {
      toast.error('กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/requests/${requestId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${backendToken}`
        },
        body: JSON.stringify({ status: "ปฏิเสธ" })
      });
      
      if (res.ok) {
        toast.success('ปฏิเสธคำขอสำเร็จ!');
        fetchRequests();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'เกิดข้อผิดพลาดในการปฏิเสธ');
      }
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการปฏิเสธ');
    }
  };

  // ฟังก์ชันโหลดข้อมูลใหม่
  const fetchRequests = async () => {
    if (!routeId || !backendToken) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers/${routeId}/requests`, {
        headers: {
          "Authorization": `Bearer ${backendToken}`
        }
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลได้');
      }

      const data = await response.json();
      const mapped = data.map((item: any) => ({
        ...item,
        product: item.product || item.title,
        user: item.user?.name || item.user || item.user_name || "-",
        weight: item.weight || item.amount || item.qty || "-",
        note: item.note || item.description || item.remark || "-",
        createdAt: item.createdAt || item.created_at || item.date || "-",
        status: item.status || item.state || "รออนุมัติ",
        budget: item.budget || 0,
      }));
      setRequests(mapped);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast.error('ไม่สามารถดึงข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, [routeId, backendToken]);

  const filtered = requests.filter((req) => {
    // ปรับ logic filter ให้ตรงกับข้อมูลจริงที่ backend ส่งมา
    const matchStatus = statusFilter === 'ทั้งหมด' || req.status === statusFilter;
    const matchSearch = (req.product || req.title || '').includes(search) || (req.user || '').includes(search) || (req.note || req.description || '').includes(search);
    return matchStatus && matchSearch;
  });

  if (tokenLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  if (showEditForm && offerData) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowEditForm(false)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปหน้าจัดการ
          </Button>
          <h1 className="text-2xl font-bold">แก้ไขรอบเดินทาง</h1>
        </div>
        
        <Card className="p-6">
          <OfferForm 
            mode="edit" 
            initialData={{
              routeFrom: offerData.route_from,
              routeTo: offerData.route_to,
              flightDate: offerData.flight_date,
              closeDate: offerData.close_date,
              deliveryDate: offerData.delivery_date,
              rate: offerData.rates,
              pickupPlace: offerData.pickup_place,
              description: offerData.description,
              contact: offerData.contact,
              urgent: offerData.urgent,
            }}
            onSubmit={handleEditOffer}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push("/my-routes")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปหน้ารายการ
          </Button>
          <h1 className="text-2xl font-bold">จัดการรอบเดินทาง</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowEditForm(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            แก้ไขรอบเดินทาง
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDeleteOffer}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            ลบรอบเดินทาง
          </Button>
        </div>
      </div>

      {/* Header summary */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-white rounded-xl shadow px-6 py-3 flex flex-col items-center min-w-[140px]">
          <div className="text-xs text-gray-400">เส้นทาง</div>
          <div className="font-bold text-lg">{routeSummary.routeFrom} → {routeSummary.routeTo}</div>
        </div>
        <div className="bg-white rounded-xl shadow px-6 py-3 flex flex-col items-center min-w-[120px]">
          <div className="text-xs text-gray-400">วันบิน</div>
          <div className="font-bold">{routeSummary.flightDate}</div>
        </div>
        <div className="bg-white rounded-xl shadow px-6 py-3 flex flex-col items-center min-w-[120px]">
          <div className="text-xs text-gray-400">ปิดรับ</div>
          <div className="font-bold">{routeSummary.closeDate}</div>
        </div>
        <div className="bg-white rounded-xl shadow px-6 py-3 flex flex-col items-center min-w-[100px]">
          <div className="text-xs text-gray-400">จำนวนคำขอ</div>
          <div className="font-bold">{routeSummary.totalRequests}</div>
        </div>
        <div className="bg-white rounded-xl shadow px-6 py-3 flex flex-col items-center min-w-[120px]">
          <div className="text-xs text-gray-400">น้ำหนักรวม</div>
          <div className="font-bold">{routeSummary.totalWeight} กก.</div>
        </div>
        <div className="bg-white rounded-xl shadow px-6 py-3 flex flex-col items-center min-w-[120px]">
          <div className="text-xs text-gray-400">รายได้รวม</div>
          <div className="font-bold text-green-600">฿{routeSummary.totalEarnings.toLocaleString()}</div>
        </div>
      </div>
      
      {/* Filter/Search */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Input
          placeholder="ค้นหาสินค้า/ผู้ฝาก/หมายเหตุ"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'รีเฟรช'}
        </Button>
      </div>
      
      {/* Table/List */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">สินค้า</th>
              <th className="px-4 py-2 text-left">ผู้ฝาก</th>
              <th className="px-4 py-2 text-center">น้ำหนัก</th>
              <th className="px-4 py-2 text-center">งบประมาณ</th>
              <th className="px-4 py-2 text-center">สถานะ</th>
              <th className="px-4 py-2 text-center">วันที่</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading && (
              <tr><td colSpan={7} className="text-center text-gray-400 py-8">ไม่พบคำขอ</td></tr>
            )}
            {loading && (
              <tr><td colSpan={7} className="text-center py-8">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>กำลังโหลด...</span>
                </div>
              </td></tr>
            )}
            {filtered.map(req => (
              <tr key={req.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-2 font-semibold">{req.product || req.title}</td>
                <td className="px-4 py-2">{req.user}</td>
                <td className="px-4 py-2 text-center">{req.weight || '-'}</td>
                <td className="px-4 py-2 text-center">฿{req.budget?.toLocaleString() || '-'}</td>
                <td className="px-4 py-2 text-center">
                  <Badge className={
                    req.status === 'รออนุมัติ' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                    req.status === 'อนุมัติ' ? 'bg-green-100 text-green-700 border border-green-200' :
                    req.status === 'ปฏิเสธ' ? 'bg-red-100 text-red-600 border border-red-200' :
                    req.status === 'สำเร็จ' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    'bg-gray-100 text-gray-700 border border-gray-200'
                  }>{req.status}</Badge>
                </td>
                <td className="px-4 py-2 text-center">{req.createdAt}</td>
                <td className="px-4 py-2 text-center flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={() => { setSelected(req); setModalOpen(true); }}>ดูรายละเอียด</Button>
                  {req.status === 'รออนุมัติ' && <Button variant="outline" size="sm" className="bg-green-500 text-white hover:bg-green-600 border-none" onClick={() => handleApprove(req.id)}>อนุมัติ</Button>}
                  {req.status === 'รออนุมัติ' && <Button variant="outline" size="sm" className="bg-red-500 text-white hover:bg-red-600 border-none" onClick={() => { setRejectTarget(req); setConfirmOpen(true); }}>ปฏิเสธ</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <RequestDetailModal open={modalOpen} onClose={() => setModalOpen(false)} request={selected} />
      <ConfirmModal
        open={confirmOpen}
        title="ยืนยันการปฏิเสธคำขอ"
        description={rejectTarget ? `คุณต้องการปฏิเสธคำขอฝากหิ้วสินค้า ${rejectTarget.product || rejectTarget.title} ของ ${rejectTarget.user} ใช่หรือไม่?` : ''}
        onConfirm={() => { handleReject(rejectTarget.id); setConfirmOpen(false); setRejectTarget(null); }}
        onCancel={() => { setConfirmOpen(false); setRejectTarget(null); }}
      />
    </div>
  );
} 