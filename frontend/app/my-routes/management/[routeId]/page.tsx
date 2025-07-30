'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { useRouter, useParams } from 'next/navigation';
import RequestDetailModal from '../../../../components/RequestDetailModal';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import { useBackendToken } from "@/lib/useBackendToken";
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

// mock data ตัวอย่าง
const mockRequests = [
  {
    id: 1,
    user: 'สมชาย',
    product: 'iPhone 15 Pro',
    status: 'รออนุมัติ',
    weight: '0.5 กก.',
    note: 'สีดำ',
    createdAt: '2024-06-01',
  },
  {
    id: 2,
    user: 'Aom',
    product: 'ขนมญี่ปุ่น',
    status: 'อนุมัติ',
    weight: '1 กก.',
    note: '-',
    createdAt: '2024-06-02',
  },
  {
    id: 3,
    user: 'John',
    product: 'รองเท้า Adidas',
    status: 'ปฏิเสธ',
    weight: '0.8 กก.',
    note: 'ขอไซส์ 42',
    createdAt: '2024-06-03',
  },
];

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
  const backendToken = useBackendToken();

  // สรุปสถิติ
  const totalRequests = requests.length;
  const totalWeight = requests.reduce((sum, r) => sum + (parseFloat(r.weight) || 0), 0);
  // TODO: เพิ่มรายได้รวมถ้ามีข้อมูล budget

  // Header summary (mock route info)
  const routeSummary = {
    routeFrom: requests[0]?.from_location || "-",
    routeTo: requests[0]?.to_location || "-",
    flightDate: requests[0]?.flight_date || requests[0]?.deadline || "-",
    closeDate: requests[0]?.close_date || requests[0]?.deadline || "-",
    totalWeight: requests.reduce((sum, r) => sum + (parseFloat(r.weight) || 0), 0),
    totalRequests: requests.length,
  };

  // Approve/Reject
  const handleApprove = async (requestId: number) => {
    if (!backendToken) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/requests/${requestId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${backendToken}`
      },
      body: JSON.stringify({ status: "อนุมัติ" })
    });
    if (res.ok) {
      fetchRequests();
    }
  };
  const handleReject = async (requestId: number) => {
    if (!backendToken) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/requests/${requestId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${backendToken}`
      },
      body: JSON.stringify({ status: "ปฏิเสธ" })
    });
    if (res.ok) {
      fetchRequests();
    }
  };
  // ฟังก์ชันโหลดข้อมูลใหม่
  const fetchRequests = () => {
    if (!routeId || !backendToken) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers/${routeId}/requests`, {
      headers: {
        "Authorization": `Bearer ${backendToken}`
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log('DATA FROM BACKEND', data); // debug field จริง
        const mapped = data.map((item: any) => ({
          ...item,
          product: item.product || item.title,
          user: item.user?.name || item.user || item.user_name || "-",
          weight: item.weight || item.amount || item.qty || "-",
          note: item.note || item.description || item.remark || "-",
          createdAt: item.createdAt || item.created_at || item.date || "-",
          status: item.status || item.state || "-",
        }));
        setRequests(mapped);
      })
      .finally(() => setLoading(false));
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

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
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
          {statusOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </Select>
        <Button variant="outline" size="sm" onClick={fetchRequests}>รีเฟรช</Button>
      </div>
      {/* Table/List */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">สินค้า</th>
              <th className="px-4 py-2 text-left">ผู้ฝาก</th>
              <th className="px-4 py-2 text-center">น้ำหนัก</th>
              <th className="px-4 py-2 text-center">สถานะ</th>
              <th className="px-4 py-2 text-center">วันที่</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading && (
              <tr><td colSpan={6} className="text-center text-gray-400 py-8">ไม่พบคำขอ</td></tr>
            )}
            {filtered.map(req => (
              <tr key={req.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-2 font-semibold">{req.product || req.title}</td>
                <td className="px-4 py-2">{req.user}</td>
                <td className="px-4 py-2 text-center">{req.weight || '-'}</td>
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
        onConfirm={() => { handleReject(rejectTarget.id); setConfirmOpen(false); setRejectTarget(null); toast.success('ปฏิเสธคำขอสำเร็จ!'); }}
        onCancel={() => { setConfirmOpen(false); setRejectTarget(null); }}
      />
    </div>
  );
} 