"use client";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, CheckCircle, Search, BadgeDollarSign, Globe, BadgeCheck, SortAsc, Eye, Star, MessageCircle, X, Sparkles, Plus, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { useUserStore } from '@/store/userStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRef } from 'react';

import Link from "next/link";
import { useBackendToken } from "@/lib/useBackendToken";

// เพิ่ม mock data สำหรับรับหิ้ว (offers)
// ลบ mockOffers

// เพิ่มฟังก์ชัน hook สำหรับขนาดหน้าจอ
function useGridColumns() {
  const [columns, setColumns] = useState(1);
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1280) setColumns(5);
      else if (w >= 1024) setColumns(4);
      else if (w >= 768) setColumns(3);
      else if (w >= 640) setColumns(2);
      else setColumns(1);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return columns;
}

export default function MarketplacePage() {
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
  const [loading, setLoading] = useState(false); // mock loading
  const [openRequestModal, setOpenRequestModal] = useState<string|null>(null);
  const [requestForm, setRequestForm] = useState({ image: '', itemName: '', weight: '', amount: '', note: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]); // ถ้ามี requests จริงให้เตรียมไว้ด้วย
  const { backendToken, loading: tokenLoading, error: tokenError } = useBackendToken();

  useEffect(() => {
    if (backendToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers`, {
        headers: { "Authorization": `Bearer ${backendToken}` }
      })
        .then(res => res.json())
        .then(data => {
          setOffers(data); // ใช้ข้อมูลตรงจาก backend
        });
      fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/requests`, {
        headers: { "Authorization": `Bearer ${backendToken}` }
      })
        .then(res => res.json())
        .then(data => {
          // mapping requests ตามเดิม (ถ้า backend ยังส่ง snake_case)
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

  // filter/sort logic สำหรับ requests (ถ้ามีข้อมูลจริง)
  let filteredRequests = requests
    .filter(r =>
      (filterCountry ? r.routeFrom === filterCountry : true) &&
      (filterStatus ? r.status === filterStatus : true) &&
      (r.routeFrom?.includes(search) || r.routeTo?.includes(search) || r.description?.includes(search))
    )
    .filter(r => !r.offer_id); // แสดงเฉพาะ request ที่สร้างเอง (ไม่ใช่ฝากหิ้วกับ offer)
  if (sortBy === "lowestPrice") {
    filteredRequests = [...filteredRequests].sort((a, b) => a.rates[0].price - b.rates[0].price);
  } else if (sortBy === "nearestDate") {
    filteredRequests = [...filteredRequests].sort((a, b) => new Date(a.flightDate).getTime() - new Date(b.flightDate).getTime());
  } else {
    filteredRequests = [...filteredRequests].sort((a, b) => new Date(b.flightDate).getTime() - new Date(a.flightDate).getTime());
  }

  // filter/sort สำหรับ offers (ข้อมูลจริง)
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
  const columns = useGridColumns();
  const rowCount = useMemo(() => Math.ceil((isRequestsTab ? paginatedRequests.length : paginatedOffers.length) / columns), [isRequestsTab, paginatedRequests.length, paginatedOffers.length, columns]);

  // กรองเฉพาะ request ที่ข้อมูลสำคัญไม่ว่าง
  const validRequests = paginatedRequests.filter(
    req =>
      req.routeFrom && req.routeTo &&
      req.routeFrom !== "undefined" && req.routeTo !== "undefined" &&
      req.rates && req.rates[0] && req.rates[0].price !== undefined
  );

  function toggleBookmark(id: number) {
    setBookmarks(bm => bm.includes(id) ? bm.filter(i => i !== id) : [...bm, id]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <main className="pt-24 max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">ตลาดฝากหิ้ว</h1>
          <p className="text-gray-600 text-lg">ค้นหาและจองบริการฝากหิ้วจากผู้เดินทาง</p>
        </div>
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
        <div className="flex items-center gap-2 mb-8 bg-white/80 rounded-full px-6 py-3 shadow-lg max-w-lg mx-auto border border-gray-100">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={tab === "requests" ? "ค้นหาของฝาก..." : "ค้นหาเส้นทาง..."}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 bg-transparent outline-none px-2 py-1 text-sm font-medium"
          />
        </div>

        {/* Card Grid */}
        <div className="mb-2 text-right text-xs text-gray-400">จำนวนแถว: {rowCount}</div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 justify-items-center">
          {isRequestsTab ? (
            validRequests.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 animate-fade-in">
                <span className="text-5xl mb-2">🛍️</span>
                <h3 className="text-lg font-semibold text-gray-500 mb-2">ยังไม่มีรายการฝากหิ้ว</h3>
                <p className="text-gray-400 mb-4">เริ่มฝากหิ้วของชิ้นแรกของคุณได้เลย!</p>
              </div>
            ) : validRequests.map((req: any) => (
              <div key={req.id} className="bg-white/95 rounded-2xl shadow-lg border border-gray-100 p-5 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-green-200">
                {/* Header with flags and route */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center -space-x-1">
                    <img src={`https://flagcdn.com/48x36/${req.routeFrom?.split(',').pop()?.trim().toLowerCase()}.png`} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                    <img src={`https://flagcdn.com/48x36/${req.routeTo?.split(',').pop()?.trim().toLowerCase()}.png`} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-lg truncate">{req.routeFrom} → {req.routeTo}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span>✈️ {req.flightDate}</span>
                      <span>•</span>
                      <span>ปิดรับ {req.closeDate}</span>
                    </div>
                  </div>
                  {req.urgent && (
                    <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full px-2 py-1 text-xs font-semibold shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      ด่วน
                    </span>
                  )}
                </div>

                {/* Price section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 mb-4">
                  <div className="text-center">
                    <div className="text-emerald-700 font-bold text-2xl">
                      {req.rates?.[0] ? `${req.rates[0].price} บาท/${req.rates[0].weight}` : "-"}
                    </div>
                  </div>
                </div>

                {/* Details section */}
                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-blue-500">📍</span>
                    <span className="truncate">จุดนัดรับ: {req.pickupPlace || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500">📞</span>
                    <span className="truncate">ติดต่อ: {req.contact || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-yellow-500">📝</span>
                    <span className="truncate">หมายเหตุ: {req.description || "-"}</span>
                  </div>
                </div>

                {/* User info */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                    {req.user?.[0] ?? "-"}
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{req.user ?? "-"}</span>
                </div>

                {/* Action button */}
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 font-semibold py-3 rounded-xl shadow-md text-base hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2" 
                  title="รับหิ้ว" 
                  onClick={() => setOpenRequestModal(req.id.toString())}
                >
                  <ShoppingBag className="w-5 h-5" />
                  รับหิ้ว
                </Button>
              </div>
            ))
          ) : (
            paginatedOffers.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 animate-fade-in">
                <span className="text-5xl mb-2">✈️</span>
                <h3 className="text-lg font-semibold text-gray-500 mb-2">ยังไม่มีรายการรับหิ้ว</h3>
                <p className="text-gray-400 mb-4">ยังไม่มีรอบเดินทางรับหิ้วในขณะนี้</p>
              </div>
            ) : paginatedOffers.map((offer: any) => {
              // ใช้ข้อมูลจริงจาก offer object
              const maxWeight = offer?.maxWeight || 10; // fallback ถ้าไม่มีข้อมูล
              const usedWeight = offer?.usedWeight || 0;
              const remainingWeight = maxWeight - usedWeight;
              return (
                <div key={offer.id} className="bg-white/95 rounded-2xl shadow-lg border border-gray-100 p-5 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-blue-200">
                  {/* Header with flags and route */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center -space-x-1">
                      <img src={`https://flagcdn.com/48x36/${offer.routeFrom?.split(',').pop()?.trim().toLowerCase()}.png`} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                      <img src={`https://flagcdn.com/48x36/${offer.routeTo?.split(',').pop()?.trim().toLowerCase()}.png`} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-lg truncate">{offer.routeFrom} → {offer.routeTo}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>✈️ {offer.flightDate}</span>
                        <span>•</span>
                        <span>ปิดรับ {offer.closeDate}</span>
                      </div>
                    </div>
                    {offer.urgent === "true" && (
                      <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full px-2 py-1 text-xs font-semibold shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        ด่วน
                      </span>
                    )}
                  </div>

                  {/* Price section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 mb-4">
                    <div className="text-center">
                      <div className="text-indigo-700 font-bold text-2xl">
                        {Array.isArray(offer.rates) && offer.rates.length > 0 && offer.rates[0].price
                          ? `${offer.rates[0].price} บาท/${offer.rates[0].weight}`
                          : "-"}
                      </div>
                    </div>
                  </div>

                  {/* Details section */}
                  <div className="space-y-2 mb-4 flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-blue-500">📍</span>
                      <span className="truncate">จุดนัดรับ: {offer.pickupPlace || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">📞</span>
                      <span className="truncate">ติดต่อ: {offer.contact || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-yellow-500">📝</span>
                      <span className="truncate">หมายเหตุ: {offer.description || "-"}</span>
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md text-base hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                    onClick={() => setOpenRequestModal(offer.id.toString())}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    รับหิ้ว
                  </button>
                </div>
              );
            })
          )}
        </div>

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

      {/* Modal/Quick View */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-fade-in border border-blue-100 dark:border-blue-900 scale-95 animate-modal-in">
            <button className="absolute top-3 right-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-pink-200 dark:hover:bg-pink-900 p-2 transition" onClick={() => setSelectedRequest(null)}><X className="w-5 h-5 text-gray-400" /></button>
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{selectedRequest.routeFrom} → {selectedRequest.routeTo}</h2>
            <img src={selectedRequest.image} className="w-full h-40 object-cover rounded mb-3" />
            <div className="border-b border-gray-200 dark:border-gray-700 mb-3" />
            <div className="space-y-1">
              <p>บิน {selectedRequest.flightDate} • ปิดรับ {selectedRequest.closeDate}</p>
              <p>ราคา: <span className="font-semibold text-blue-700 dark:text-blue-300">{selectedRequest.rates[0].price} บาท/{selectedRequest.rates[0].weight}</span></p>
              <p>สถานะ: <span className="font-semibold">{selectedRequest.status}</span></p>
              <p>ผู้ใช้: <span className="font-semibold">{selectedRequest.user}</span></p>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="rounded-full bg-white/80 dark:bg-gray-900/80 shadow p-2 hover:bg-green-100 dark:hover:bg-green-900 transition" title="ติดต่อ" onClick={() => alert(`ติดต่อ ${selectedRequest.user}`)}><MessageCircle className="w-5 h-5 text-green-400" /></button>
              <button className="rounded-full bg-white/80 dark:bg-gray-900/80 shadow p-2 hover:bg-pink-100 dark:hover:bg-pink-900 transition" title="บันทึกรายการ" onClick={() => toggleBookmark(selectedRequest.id)}>{bookmarks.includes(selectedRequest.id) ? <Star className="w-5 h-5 text-pink-400" /> : <Star className="w-5 h-5 text-gray-300" />}</button>
            </div>
          </div>
        </div>
      )}

      {/* เพิ่ม modal ฟอร์มฝากหิ้ว */}
      {openRequestModal && (
        <Dialog open={true} onOpenChange={() => setOpenRequestModal(null)}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
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
                      title: requestForm.itemName,
                      from_location: "", // เพิ่มค่าจริงตามที่ต้องการ
                      to_location: "",   // เพิ่มค่าจริงตามที่ต้องการ
                      deadline: "",      // เพิ่มค่าจริงตามที่ต้องการ
                      budget: 0,          // เพิ่มค่าจริงตามที่ต้องการ
                      description: requestForm.note,
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
                  <Input placeholder="ชื่อสินค้า" className="rounded-xl border px-3 py-2" value={requestForm.itemName} onChange={e => setRequestForm(f => ({ ...f, itemName: e.target.value }))} required />
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
          </div>
        </Dialog>
      )}
    </div>
  );
}
