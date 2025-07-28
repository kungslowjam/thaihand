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
import { Progress } from '@/components/progress';
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
  const backendToken = useBackendToken();

  useEffect(() => {
    if (backendToken) {
      fetch("http://localhost:8000/api/offers", {
        headers: { "Authorization": `Bearer ${backendToken}` }
      })
        .then(res => res.json())
        .then(data => {
          setOffers(data); // ใช้ข้อมูลตรงจาก backend
        });
      fetch("http://localhost:8000/api/requests", {
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

        {/* Card Grid */}
        <div className="mb-2 text-right text-xs text-gray-400">จำนวนแถว: {rowCount}</div>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 justify-center">
          {isRequestsTab ? (
            validRequests.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 animate-fade-in">
                <span className="text-5xl mb-2">🛍️</span>
                <h3 className="text-lg font-semibold text-gray-500 mb-2">ยังไม่มีรายการฝากหิ้ว</h3>
                <p className="text-gray-400 mb-4">เริ่มฝากหิ้วของชิ้นแรกของคุณได้เลย!</p>
              </div>
            ) : validRequests.map((req: any) => (
              <div key={req.id} className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow border border-white/30 dark:border-gray-800 flex flex-col overflow-hidden min-w-[260px] animate-fade-in">
                {/* รูปภาพ + badge + ปุ่ม action */}
                <div className="relative">
                  <img src={req.image} alt={req.routeFrom + " → " + req.routeTo} className="w-full h-40 object-cover" />
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    {req.urgent && <Badge className="bg-pink-100 text-pink-600 rounded-full px-2 py-0.5 text-xs flex items-center gap-1"><Sparkles className="w-3 h-3" />ด่วน</Badge>}
                    {/* ปุ่ม bookmark/chat (mock) */}
                    <button className="rounded-full bg-white/90 dark:bg-gray-900/90 shadow p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 transition" title="บันทึกรายการ"><Star className="w-4 h-4 text-pink-400" /></button>
                    <button className="rounded-full bg-white/90 dark:bg-gray-900/90 shadow p-1.5 hover:bg-green-100 dark:hover:bg-green-900 transition" title="ติดต่อ"><MessageCircle className="w-4 h-4 text-green-400" /></button>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  {/* ชื่อสินค้า */}
                  <div className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate flex items-center gap-2">
                    <Plane className="h-5 w-5 text-indigo-400" />
                    {req.routeFrom} → {req.routeTo}
                  </div>
                  {/* badge ประเภท/สถานะ */}
                  <div className="flex gap-2 mb-2">
                    <Badge className="bg-gradient-to-r from-indigo-200 to-indigo-400 text-indigo-800 px-2 py-0.5 text-xs rounded-full flex items-center gap-1"><Plane className="h-3 w-3 mr-1" /> รับหิ้ว</Badge>
                  </div>
                  {/* เส้นทาง + วันที่ */}
                  <div className="text-sm text-gray-500 mb-2">บิน {req.flightDate} • ปิดรับ {req.closeDate}</div>
                  {/* ราคา + สถานะ */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-700 dark:text-blue-300 font-semibold text-lg flex items-center gap-1"><BadgeDollarSign className="h-4 w-4" />
                      {req.rates?.[0] ? `${req.rates[0].price} บาท/${req.rates[0].weight}` : "-"}
                    </span>
                    <Badge className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 bg-indigo-100 text-indigo-700`}><span className='mr-1'>✈️</span>{req.status}</Badge>
                  </div>
                  {/* น้ำหนักคงเหลือ (gauge) */}
                  <Progress value={0} className="h-4 bg-gray-200 mt-2" />
                  <div className="flex justify-between items-center mt-1 text-xs">
                    <span className="text-gray-500 font-semibold">เหลือ 0 กก.</span>
                  </div>
                  {/* ผู้ใช้ */}
                  <div className="flex items-center gap-2 mt-auto mb-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">{req.user?.[0] ?? "-"}</div>
                    <span className="text-sm text-gray-700 dark:text-gray-200">{req.user ?? "-"}</span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800 my-2" />
                  <Button size="lg" variant="outline" className="w-full rounded-b-2xl py-2 text-base font-semibold shadow hover:bg-indigo-50/60 hover:scale-105 transition flex items-center gap-2" title="ฝากหิ้ว" onClick={() => setOpenRequestModal(req.id.toString())}><span>ฝากหิ้ว</span></Button>
                </div>
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
              // สมมุติ maxWeight = 10, usedWeight = 4 (mock)
              const maxWeight = 10;
              const usedWeight = 4;
              const remainingWeight = maxWeight - usedWeight;
              return (
                <div key={offer.id} className="bg-white/90 rounded-3xl shadow-2xl border-0 p-6 flex flex-col w-full max-w-[320px] mx-auto transition-transform hover:scale-105 hover:shadow-[0_8px_32px_rgba(80,80,200,0.15)] duration-200">
                  <div className="flex items-center gap-2 mb-4">
                    {/* ธงชาติแบบ flex row ไม่ absolute */}
                    <img src={`https://flagcdn.com/48x36/${offer.routeFrom?.split(',').pop()?.trim().toLowerCase()}.png`} alt="" className="w-7 h-7 rounded-full border-2 border-white shadow" />
                    <img src={`https://flagcdn.com/48x36/${offer.routeTo?.split(',').pop()?.trim().toLowerCase()}.png`} alt="" className="w-7 h-7 rounded-full border-2 border-white shadow -ml-2" />
                    <div className="ml-2 flex-1 truncate font-bold text-lg text-gray-900">{offer.routeFrom} → {offer.routeTo}</div>
                    {offer.urgent === "true" && (
                      <span className="ml-auto bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-full px-3 py-0.5 text-xs font-semibold shadow flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2v2m6.364 1.636l-1.414 1.414M22 12h-2m-1.636 6.364l-1.414-1.414M12 22v-2m-6.364-1.636l1.414-1.414M2 12h2m1.636-6.364l1.414 1.414" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        ด่วน
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mb-2 gap-2">
                    <span>✈️ {offer.flightDate}</span>
                    <span>•</span>
                    <span>ปิดรับ {offer.closeDate}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-indigo-700 font-bold text-xl">
                      {Array.isArray(offer.rates) && offer.rates.length > 0 && offer.rates[0].price
                        ? `${offer.rates[0].price} บาท/${offer.rates[0].weight}`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2"><span className="text-blue-400">📍</span> <span>จุดนัดรับ: {offer.pickupPlace || "-"}</span></div>
                    <div className="flex items-center gap-2"><span className="text-green-400">📞</span> <span>ติดต่อ: {offer.contact || "-"}</span></div>
                    <div className="flex items-center gap-2"><span className="text-yellow-400">📝</span> <span>หมายเหตุ: {offer.description || "-"}</span></div>
                  </div>
                  <button
                    className="mt-auto w-full bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold py-2.5 rounded-2xl shadow-lg text-base hover:scale-105 transition"
                    onClick={() => setOpenRequestModal(offer.id.toString())}
                  >
                    ฝากหิ้ว
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
              <DialogTitle>ฝากหิ้วสินค้า</DialogTitle>
              <button
                className="absolute top-4 right-4 rounded-full bg-gray-100 hover:bg-pink-200 p-2 transition"
                onClick={() => setOpenRequestModal(null)}
                type="button"
              >
                <span className="text-gray-400 text-xl">✕</span>
              </button>
              <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">ฝากหิ้วสินค้า</h2>
              <form onSubmit={async e => {
                e.preventDefault();
                try {
                  const res = await fetch("http://localhost:8000/api/requests", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      ...(backendToken ? { "Authorization": `Bearer ${backendToken}` } : {})
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
                    alert("ส่งคำขอฝากหิ้วสำเร็จ!");
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
                <button type="submit" className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 text-white font-bold py-3 rounded-2xl shadow-lg text-lg hover:scale-105 transition">ส่งคำขอ</button>
              </form>
            </DialogContent>
          </div>
        </Dialog>
      )}
    </div>
  );
}
