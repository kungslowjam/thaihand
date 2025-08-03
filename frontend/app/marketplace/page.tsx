"use client";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, CheckCircle, Search, BadgeDollarSign, Globe, BadgeCheck, SortAsc, Eye, Star, MessageCircle, X, Sparkles, Plus, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { useUserStore } from '@/store/userStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRef } from 'react';
import RequestGrid from '@/components/RequestGrid';
import RequestDetailModal from '@/components/RequestDetailModal';

import Link from "next/link";
import { useBackendToken } from "@/lib/useBackendToken";

// ฟังก์ชันย่อชื่อสถานที่
function shortenLocation(location: string) {
  if (!location) return "";
  const parts = location.split(',');
  if (parts.length >= 2) {
    const city = parts[0].trim();
    const country = parts[parts.length - 1].trim();
    return `${city}, ${country}`;
  }
  return location;
}

export default function MarketplacePage() {
  // Add error boundary
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
    });
  }
  const { data: session } = useSession();
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);
  const [tab, setTab] = useState<"requests" | "offers">("requests");
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [openRequestModal, setOpenRequestModal] = useState<string|null>(null);
  const [requestForm, setRequestForm] = useState({ image: '', itemName: '', weight: '', amount: '', note: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const { backendToken, loading: tokenLoading, error: tokenError } = useBackendToken();

  useEffect(() => {
    if (backendToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers`, {
        headers: { "Authorization": `Bearer ${backendToken}` }
      })
        .then(res => res.json())
        .then(data => {
          setOffers(data);
        })
        .catch(error => {
          console.error('Error fetching offers:', error);
          setOffers([]);
        });
      fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/requests`, {
        headers: { "Authorization": `Bearer ${backendToken}` }
      })
        .then(res => res.json())
        .then(data => {
          const mapped = data.map((item: any) => ({
            ...item,
            routeFrom: item.from_location || item.routeFrom,
            routeTo: item.to_location || item.routeTo,
            flightDate: item.deadline || item.flightDate,
            closeDate: item.close_date || item.closeDate,
            rates: item.rates || [{ price: item.budget || "-", weight: "1kg" }],
            image: item.image,
            user: item.user,
            status: item.status,
          }));
          setRequests(mapped);
        })
        .catch(error => {
          console.error('Error fetching requests:', error);
          setRequests([]);
        });
    }
  }, [backendToken]);

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

  // filter/sort logic สำหรับ requests
  let filteredRequests = requests
    .filter(r =>
      (filterCountry ? r.routeFrom === filterCountry : true) &&
      (filterStatus ? r.status === filterStatus : true) &&
      (r.routeFrom?.includes(search) || r.routeTo?.includes(search) || r.description?.includes(search))
    )
    .filter(r => !r.offer_id);

  if (sortBy === "lowestPrice") {
    filteredRequests = [...filteredRequests].sort((a, b) => a.rates[0].price - b.rates[0].price);
  } else if (sortBy === "nearestDate") {
    filteredRequests = [...filteredRequests].sort((a, b) => new Date(a.flightDate).getTime() - new Date(b.flightDate).getTime());
  } else {
    filteredRequests = [...filteredRequests].sort((a, b) => new Date(b.flightDate).getTime() - new Date(a.flightDate).getTime());
  }

  // filter/sort สำหรับ offers
  let filteredOffers = offers
    .filter(o =>
      (filterCountry ? o.routeTo === filterCountry : true) &&
      (filterStatus ? o.status === filterStatus : true) &&
      (o.routeFrom?.includes(search) || o.routeTo?.includes(search) || o.description?.includes(search))
    );
  if (sortBy === "lowestPrice") {
    filteredOffers = [...filteredOffers].sort((a, b) => a.rates[0].price - b.rates[0].price);
  } else if (sortBy === "nearestDate") {
    filteredOffers = [...filteredOffers].sort((a, b) => new Date(a.flightDate).getTime() - new Date(b.flightDate).getTime());
  } else {
    filteredOffers = [...filteredOffers].sort((a, b) => new Date(b.flightDate).getTime() - new Date(a.flightDate).getTime());
  }

  // เลือก data ตาม tab
  const isRequestsTab = tab === "requests";
  const paginatedRequests = filteredRequests.slice((page - 1) * pageSize, page * pageSize);
  const paginatedOffers = filteredOffers.slice((page - 1) * pageSize, page * pageSize);

  // กรองเฉพาะ request ที่ข้อมูลสำคัญไม่ว่าง
  const validRequests = paginatedRequests.filter(
    req =>
      req.routeFrom && req.routeTo &&
      req.routeFrom !== "undefined" && req.routeTo !== "undefined" &&
      req.rates && req.rates[0] && req.rates[0].price !== undefined
  );

  // แปลงข้อมูลให้ตรงกับ RequestCard
  const mappedRequests = validRequests.map(req => ({
    id: req.id,
    title: req.title || "สินค้าทั่วไป",
    from_location: req.routeFrom,
    to_location: req.routeTo,
    deadline: req.flightDate,
    close_date: req.closeDate,
    budget: req.rates?.[0]?.price || req.budget || 0,
    description: req.description || "ไม่มีรายละเอียดเพิ่มเติม",
    image: req.image,
    status: req.status || "รออนุมัติ",
    user: req.user,
    user_email: req.user_email,
    user_image: req.user_image,
    carrier_name: req.carrier_name,
    carrier_email: req.carrier_email,
    carrier_phone: req.carrier_phone,
    carrier_image: req.carrier_image,
    offer_id: req.offer_id,
    source: req.source,
    created_at: req.created_at,
    updated_at: req.updated_at,
    urgent: req.urgent,
    weight: req.weight,
    amount: req.amount,
    note: req.note,
    payment_status: req.payment_status,
    shipping_status: req.shipping_status,
    rating: req.rating,
    review_count: req.review_count,
    pickup_place: req.pickup_place,
    contact: req.contact
  }));

  const mappedOffers = paginatedOffers.map(offer => ({
    id: offer.id,
    title: offer.title || "สินค้าทั่วไป",
    from_location: offer.routeFrom,
    to_location: offer.routeTo,
    deadline: offer.flightDate,
    close_date: offer.closeDate,
    budget: offer.rates?.[0]?.price || offer.budget || 0,
    description: offer.description || "ไม่มีรายละเอียดเพิ่มเติม",
    image: offer.image,
    status: offer.status || "รออนุมัติ",
    user: offer.user_name,
    user_email: offer.user_email,
    user_image: offer.user_image,
    carrier_name: offer.carrier_name,
    carrier_email: offer.carrier_email,
    carrier_phone: offer.carrier_phone,
    carrier_image: offer.carrier_image,
    offer_id: offer.id,
    source: offer.source,
    created_at: offer.created_at,
    updated_at: offer.updated_at,
    urgent: offer.urgent,
    weight: offer.weight,
    amount: offer.amount,
    note: offer.note,
    payment_status: offer.payment_status,
    shipping_status: offer.shipping_status,
    rating: offer.rating,
    review_count: offer.review_count,
    pickup_place: offer.pickupPlace,
    contact: offer.contact
  }));

  function toggleBookmark(id: number) {
    setBookmarks(bm => bm.includes(id) ? bm.filter(i => i !== id) : [...bm, id]);
  }

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  const handleContact = (id: number) => {
    setOpenRequestModal(id.toString());
  };

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <main className="pt-24 max-w-7xl mx-auto px-4">
          {/* Filter/Sort Bar */}
          <div className="sticky top-16 z-20 flex flex-wrap gap-2 bg-white/70 dark:bg-gray-900/70 rounded-xl px-3 py-2 shadow-sm border border-white/30 dark:border-gray-800 backdrop-blur-xl mb-4">
            <div className="flex items-center bg-transparent rounded-full px-2 py-0.5">
              <Globe className="w-4 h-4 text-gray-400 mr-1" />
              <select className="bg-transparent outline-none text-xs" value={filterCountry} onChange={e => { setFilterCountry(e.target.value); setPage(1); }}>
                <option value="">ทุกประเทศ</option>
                <option value="Osaka">Osaka</option>
                <option value="Sydney">Sydney</option>
              </select>
            </div>
            <div className="flex items-center bg-transparent rounded-full px-2 py-0.5">
              <BadgeCheck className="w-4 h-4 text-gray-400 mr-1" />
              <select className="bg-transparent outline-none text-xs" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
                <option value="">ทุกสถานะ</option>
                <option value="รอรับหิ้ว">รอรับหิ้ว</option>
                <option value="สำเร็จ">สำเร็จ</option>
              </select>
            </div>
            <div className="flex items-center bg-transparent rounded-full px-2 py-0.5">
              <SortAsc className="w-4 h-4 text-gray-400 mr-1" />
              <select className="bg-transparent outline-none text-xs" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">ใหม่สุด</option>
                <option value="lowestPrice">ราคาต่ำสุด</option>
                <option value="nearestDate">ใกล้วันเดินทาง</option>
              </select>
            </div>
            <div className="flex-1" />
            <div className="flex gap-1">
              <Button size="sm" variant={tab === "requests" ? "default" : "outline"} className={`rounded-full px-4 py-1 text-xs font-semibold`} onClick={() => { setTab("requests"); setPage(1); }}>ฝากหิ้ว</Button>
              <Button size="sm" variant={tab === "offers" ? "default" : "outline"} className={`rounded-full px-4 py-1 text-xs font-semibold`} onClick={() => { setTab("offers"); setPage(1); }}>รับหิ้ว</Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-8 bg-white/60 dark:bg-gray-800/60 rounded-full px-4 py-2 shadow-sm max-w-lg mx-auto">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={tab === "requests" ? "ค้นหาของฝาก..." : "ค้นหาเส้นทาง..."}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 bg-transparent outline-none px-2 py-1 text-sm"
            />
          </div>

          {/* Request Grid */}
          {isRequestsTab ? (
            <RequestGrid
              requests={mappedRequests}
              mode="view"
              loading={loading}
              onView={handleViewRequest}
              onContact={handleContact}
              onBookmark={toggleBookmark}
              bookmarkedIds={bookmarks}
              showFilters={false}
              showSearch={false}
              showSort={false}
              showViewToggle={false}
            />
          ) : (
            <RequestGrid
              requests={mappedOffers}
              mode="view"
              loading={loading}
              onView={handleViewRequest}
              onContact={handleContact}
              onBookmark={toggleBookmark}
              bookmarkedIds={bookmarks}
              showFilters={false}
              showSearch={false}
              showSort={false}
              showViewToggle={false}
            />
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-8 gap-2">
            <Button size="sm" variant="outline" className="px-3 py-1 text-xs" disabled={page === 1} onClick={() => setPage(page - 1)}>ก่อนหน้า</Button>
            <span className="mx-2 text-xs">หน้า {page}</span>
            <Button size="sm" variant="outline" className="px-3 py-1 text-xs" disabled={page * pageSize >= (isRequestsTab ? filteredRequests.length : filteredOffers.length)} onClick={() => setPage(page + 1)}>ถัดไป</Button>
          </div>
        </main>

        {/* Floating Action Button */}
        <Link href="/create-request">
          <button className="fixed bottom-8 right-8 z-50 rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-pink-400 text-white shadow-2xl p-4 hover:scale-110 transition-all flex items-center gap-2" title="สร้างรายการใหม่">
            <Plus className="w-6 h-6" />
            <span className="hidden md:inline font-semibold">สร้างรายการใหม่</span>
          </button>
        </Link>

        {/* Detail Modal */}
        {selectedRequest && (
          <RequestDetailModal
            open={true}
            onClose={handleCloseModal}
            request={selectedRequest}
            mode="view"
            onContact={handleContact}
            onBookmark={toggleBookmark}
            isBookmarked={bookmarks.includes(selectedRequest.id)}
          />
        )}

        {/* เพิ่ม modal ฟอร์มรับหิ้ว */}
        {openRequestModal && (
          <Dialog open={true} onOpenChange={() => setOpenRequestModal(null)}>
            <DialogContent className="bg-white/90 rounded-3xl p-10 max-w-md w-full shadow-2xl border-0 relative animate-fade-in flex flex-col items-center">
                <DialogTitle>รับหิ้วสินค้า</DialogTitle>
                <button
                  className="absolute top-4 right-4 rounded-full bg-gray-100 hover:bg-pink-200 p-2 transition"
                  onClick={() => setOpenRequestModal(null)}
                  type="button"
                >
                  <span className="text-gray-400 text-xl">✕</span>
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">รับหิ้วสินค้า</h2>
                <p className="text-sm text-gray-500 mb-4 text-center">กรุณากรอกข้อมูลสินค้าที่ต้องการรับหิ้ว</p>
                <form onSubmit={async e => {
                  e.preventDefault();
                  try {
                    if (!backendToken) {
                      alert("กรุณาเข้าสู่ระบบก่อนส่งคำขอ");
                      return;
                    }
                    
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/requests`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${backendToken}`
                      },
                      body: JSON.stringify({
                        title: requestForm.itemName || "สินค้าทั่วไป",
                        from_location: "", // เพิ่มค่าจริงตามที่ต้องการ
                        to_location: "",   // เพิ่มค่าจริงตามที่ต้องการ
                        deadline: "",      // เพิ่มค่าจริงตามที่ต้องการ
                        budget: parseInt(requestForm.amount) || 0,
                        description: requestForm.note || "ไม่มีรายละเอียดเพิ่มเติม",
                        image: requestForm.image,
                        offer_id: openRequestModal ? parseInt(openRequestModal) : undefined,
                        source: "marketplace"
                      })
                    });
                    if (res.ok) {
                      setOpenRequestModal(null);
                      setRequestForm({ image: '', itemName: '', weight: '', amount: '', note: '' });
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      alert("ส่งคำขอรับหิ้วสำเร็จ!");
                    } else if (res.status === 401) {
                      alert("กรุณาเข้าสู่ระบบก่อนส่งคำขอ");
                    } else {
                      const text = await res.text();
                      alert("เกิดข้อผิดพลาด: " + text);
                    }
                  } catch (err) {
                    alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
                  }
                }} className="w-full flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">รูปสินค้า</label>
                    <Input type="file" accept="image/*" ref={fileInputRef} className="mb-2" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => setRequestForm(f => ({ ...f, image: ev.target?.result as string }));
                        reader.readAsDataURL(file);
                      }
                    }} />
                    {requestForm.image && <img src={requestForm.image} alt="preview" className="w-full h-32 object-cover rounded-lg border mb-2" />}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">ชื่อสินค้า</label>
                    <Input placeholder="เช่น ไดฟูกุ, ช็อกโกแลต, เสื้อผ้า" className="rounded-xl border px-3 py-2" value={requestForm.itemName} onChange={e => setRequestForm(f => ({ ...f, itemName: e.target.value }))} required />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold mb-1">น้ำหนัก (กก.)</label>
                      <Input type="number" placeholder="น้ำหนัก (กก.)" className="rounded-xl border px-3 py-2" value={requestForm.weight} onChange={e => setRequestForm(f => ({ ...f, weight: e.target.value }))} required />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold mb-1">จำนวน</label>
                      <Input type="number" placeholder="จำนวน" className="rounded-xl border px-3 py-2" value={requestForm.amount} onChange={e => setRequestForm(f => ({ ...f, amount: e.target.value }))} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">หมายเหตุ (ถ้ามี)</label>
                    <Textarea placeholder="หมายเหตุ (ถ้ามี)" className="rounded-xl border px-3 py-2" value={requestForm.note} onChange={e => setRequestForm(f => ({ ...f, note: e.target.value }))} />
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 text-white font-bold py-3 rounded-2xl shadow-lg text-lg hover:scale-105 transition">ส่งคำขอรับหิ้ว</button>
                </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in MarketplacePage:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-4">ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }
}
