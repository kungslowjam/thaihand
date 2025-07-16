"use client";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, CheckCircle, Search, BadgeDollarSign, Globe, BadgeCheck, SortAsc, Eye, Star, MessageCircle, X, Sparkles, Plus, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession, signOut } from "next-auth/react";
import { useUserStore } from '@/store/userStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Dialog, DialogContent } from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRef } from 'react';
import { Progress } from '@/components/progress';
import { mockRequests, mockOffers } from "@/lib/mockData";

// เพิ่ม mock data สำหรับรับหิ้ว (offers)
const mockOffers = [
  { id: 1, routeFrom: "Bangkok", routeTo: "Tokyo", flightDate: "2024-07-15", closeDate: "2024-07-10", deliveryDate: "2024-07-20", rates: [{ weight: "1kg", price: 300 }], pickupPlace: "สนามบินสุวรรณภูมิ", itemTypes: ["ขนม", "เครื่องสำอาง"], description: "รับหิ้วของจากไทยไปญี่ปุ่น รอบนี้รับจำนวนจำกัด!", restrictions: ["ของเหลวเกิน 100ml"], contact: "Line: somchai", urgent: false, image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=400&q=80", user: "Somchai", status: "เปิดรับหิ้ว" },
  { id: 2, routeFrom: "Bangkok", routeTo: "Sydney", flightDate: "2024-07-18", closeDate: "2024-07-14", deliveryDate: "2024-07-22", rates: [{ weight: "2kg", price: 500 }], pickupPlace: "สนามบินดอนเมือง", itemTypes: ["วิตามิน", "อาหารเสริม"], description: "รับหิ้วของไปออสเตรเลีย รอบนี้ราคาพิเศษ!", restrictions: ["อาหารสด"], contact: "FB: beeaus", urgent: true, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=400&q=80", user: "Bee", status: "เปิดรับหิ้ว" },
];

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

  // filter/sort logic (mock)
  let filteredRequests = mockRequests
    .filter(r =>
      (filterCountry ? r.from === filterCountry : true) &&
      (filterStatus ? r.status === filterStatus : true) &&
      (r.title.includes(search) || r.from.includes(search) || r.to.includes(search))
    );
  if (sortBy === "lowestPrice") {
    filteredRequests = [...filteredRequests].sort((a, b) => a.price - b.price);
  } else if (sortBy === "nearestDate") {
    filteredRequests = [...filteredRequests].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } else {
    filteredRequests = [...filteredRequests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // filter/sort สำหรับ offers
  let filteredOffers = mockOffers
    .filter(o =>
      (filterCountry ? o.routeTo === filterCountry : true) &&
      (filterStatus ? o.status === filterStatus : true) &&
      (o.routeFrom.includes(search) || o.routeTo.includes(search) || o.description.includes(search))
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
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
          {isRequestsTab ? (
            paginatedRequests.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 animate-fade-in">
                <span className="text-5xl mb-2">🛍️</span>
                <h3 className="text-lg font-semibold text-gray-500 mb-2">ยังไม่มีรายการฝากหิ้ว</h3>
                <p className="text-gray-400 mb-4">เริ่มฝากหิ้วของชิ้นแรกของคุณได้เลย!</p>
              </div>
            ) : paginatedRequests.map((req: typeof mockRequests[number]) => (
              <div key={req.id} className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow border border-white/30 dark:border-gray-800 flex flex-col overflow-hidden min-w-[260px] animate-fade-in">
                {/* รูปภาพ + badge + ปุ่ม action */}
                <div className="relative">
                  <img src={req.image} alt={req.title} className="w-full h-40 object-cover" />
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    {req.isNew && <Badge className="bg-pink-100 text-pink-600 rounded-full px-2 py-0.5 text-xs flex items-center gap-1"><Sparkles className="w-3 h-3" />ใหม่</Badge>}
                    {req.isHot && <Badge className="bg-yellow-100 text-yellow-600 rounded-full px-2 py-0.5 text-xs flex items-center gap-1"><Sparkles className="w-3 h-3" />Hot</Badge>}
                    {/* ปุ่ม bookmark/chat (mock) */}
                    <button className="rounded-full bg-white/90 dark:bg-gray-900/90 shadow p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 transition" title="บันทึกรายการ"><Star className="w-4 h-4 text-pink-400" /></button>
                    <button className="rounded-full bg-white/90 dark:bg-gray-900/90 shadow p-1.5 hover:bg-green-100 dark:hover:bg-green-900 transition" title="ติดต่อ"><MessageCircle className="w-4 h-4 text-green-400" /></button>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  {/* ชื่อสินค้า */}
                  <div className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-blue-400" />
                    {req.title}
                  </div>
                  {/* badge ประเภท/สถานะ */}
                  <div className="flex gap-2 mb-2">
                    <Badge className="bg-gradient-to-r from-blue-200 to-blue-400 text-blue-800 px-2 py-0.5 text-xs rounded-full flex items-center gap-1"><ShoppingBag className="h-3 w-3 mr-1" /> ฝากหิ้ว</Badge>
                  </div>
                  {/* เส้นทาง + วันที่ */}
                  <div className="text-sm text-gray-500 mb-2">{req.from} → {req.to} • {req.date}</div>
                  {/* ราคา + สถานะ */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-700 dark:text-green-300 font-semibold text-lg flex items-center gap-1"><BadgeDollarSign className="h-4 w-4" />{req.price} บาท</span>
                    <Badge className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${req.status === "สำเร็จ" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{req.status === "สำเร็จ" ? <span className='mr-1'>✔️</span> : <span className='mr-1'>⏳</span>}{req.status}</Badge>
                  </div>
                  {/* ผู้ใช้ */}
                  <div className="flex items-center gap-2 mt-auto mb-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">{req.user[0]}</div>
                    <span className="text-sm text-gray-700 dark:text-gray-200">{req.user}</span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800 my-2" />
                  {/* ปุ่มขอรับหิ้ว */}
                  <Button size="lg" variant="outline" className="w-full rounded-b-2xl py-2 text-base font-semibold shadow hover:bg-blue-50/60 hover:scale-105 transition flex items-center gap-2" title="ขอรับหิ้ว"><span>ขอรับหิ้ว</span></Button>
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
            ) : paginatedOffers.map((offer: typeof mockOffers[number]) => {
              // สมมุติ maxWeight = 10, usedWeight = 4 (mock)
              const maxWeight = 10;
              const usedWeight = 4;
              const remainingWeight = maxWeight - usedWeight;
              return (
                <div key={offer.id} className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow border border-white/30 dark:border-gray-800 flex flex-col overflow-hidden min-w-[260px] animate-fade-in">
                  <div className="relative">
                    <img src={offer.image} alt={offer.routeFrom + '-' + offer.routeTo} className="w-full h-40 object-cover" />
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                      {offer.urgent && <Badge className="bg-pink-100 text-pink-600 rounded-full px-2 py-0.5 text-xs flex items-center gap-1"><Sparkles className="w-3 h-3" />ด่วน</Badge>}
                      <button className="rounded-full bg-white/90 dark:bg-gray-900/90 shadow p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 transition" title="บันทึกรายการ"><Star className="w-4 h-4 text-pink-400" /></button>
                      <button className="rounded-full bg-white/90 dark:bg-gray-900/90 shadow p-1.5 hover:bg-green-100 dark:hover:bg-green-900 transition" title="ติดต่อ"><MessageCircle className="w-4 h-4 text-green-400" /></button>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate flex items-center gap-2">
                      <Plane className="h-5 w-5 text-indigo-400" />
                      {offer.routeFrom} → {offer.routeTo}
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Badge className="bg-gradient-to-r from-indigo-200 to-indigo-400 text-indigo-800 px-2 py-0.5 text-xs rounded-full flex items-center gap-1"><Plane className="h-3 w-3 mr-1" /> รับหิ้ว</Badge>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">บิน {offer.flightDate} • ปิดรับ {offer.closeDate}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-700 dark:text-blue-300 font-semibold text-lg flex items-center gap-1"><BadgeDollarSign className="h-4 w-4" />{offer.rates[0].price} บาท/{offer.rates[0].weight}</span>
                      <Badge className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 bg-indigo-100 text-indigo-700`}><span className='mr-1'>✈️</span>{offer.status}</Badge>
                    </div>
                    {/* น้ำหนักคงเหลือ (gauge) */}
                    <Progress value={Math.min((usedWeight / maxWeight) * 100, 100)} className="h-4 bg-gray-200 mt-2" />
                    <div className="flex justify-between items-center mt-1 text-xs">
                      <span className="text-gray-500 font-semibold">เหลือ {remainingWeight.toFixed(2)} กก.</span>
                    </div>
                    <div className="flex items-center gap-2 mt-auto mb-2">
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">{offer.user[0]}</div>
                      <span className="text-sm text-gray-700 dark:text-gray-200">{offer.user}</span>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-800 my-2" />
                    <Button size="lg" variant="outline" className="w-full rounded-b-2xl py-2 text-base font-semibold shadow hover:bg-indigo-50/60 hover:scale-105 transition flex items-center gap-2" title="ฝากหิ้ว" onClick={() => setOpenRequestModal(offer.id.toString())}><span>ฝากหิ้ว</span></Button>
                  </div>
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
      <button className="fixed bottom-8 right-8 z-50 rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-pink-400 text-white shadow-2xl p-4 hover:scale-110 transition-all flex items-center gap-2" title="สร้างรายการใหม่">
        <Plus className="w-6 h-6" />
        <span className="hidden md:inline font-semibold">สร้างรายการใหม่</span>
      </button>

      {/* Modal/Quick View */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-fade-in border border-blue-100 dark:border-blue-900 scale-95 animate-modal-in">
            <button className="absolute top-3 right-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-pink-200 dark:hover:bg-pink-900 p-2 transition" onClick={() => setSelectedRequest(null)}><X className="w-5 h-5 text-gray-400" /></button>
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{selectedRequest.title}</h2>
            <img src={selectedRequest.image} className="w-full h-40 object-cover rounded mb-3" />
            <div className="border-b border-gray-200 dark:border-gray-700 mb-3" />
            <div className="space-y-1">
              <p>จาก: <span className="font-semibold">{selectedRequest.from}</span> → <span className="font-semibold">{selectedRequest.to}</span></p>
              <p>ราคา: <span className="font-semibold text-green-700 dark:text-green-300">{selectedRequest.price} บาท</span></p>
              <p>สถานะ: <span className="font-semibold">{selectedRequest.status}</span></p>
              <p>วันที่: <span className="font-semibold">{selectedRequest.date}</span></p>
              <p>โดย: <span className="font-semibold">{selectedRequest.user}</span></p>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="rounded-full bg-white/80 dark:bg-gray-900/80 shadow p-2 hover:bg-green-100 dark:hover:bg-green-900 transition" title="ติดต่อ" onClick={() => alert(`ติดต่อ ${selectedRequest.user}`)}><MessageCircle className="w-5 h-5 text-green-400" /></button>
              <button className="rounded-full bg-white/80 dark:bg-gray-900/80 shadow p-2 hover:bg-pink-100 dark:hover:bg-pink-900 transition" title="บันทึกรายการ" onClick={() => toggleBookmark(selectedRequest.id)}>{bookmarks.includes(selectedRequest.id) ? <Star className="w-5 h-5 text-pink-400" /> : <Star className="w-5 h-5 text-gray-300" />}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ฟอร์มฝากหิ้ว */}
      {openRequestModal && (
        <Dialog open={true} onOpenChange={() => setOpenRequestModal(null)}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <DialogContent className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-blue-100 relative animate-fade-in">
              <button
                className="absolute top-4 right-4 rounded-full bg-gray-100 hover:bg-pink-200 p-2 transition"
                onClick={() => setOpenRequestModal(null)}
                type="button"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">ฝากหิ้วสินค้า</h2>
              <form onSubmit={e => {
                e.preventDefault();
                // mock ส่งข้อมูลไป my-carry-orders/[id]
                console.log('ส่งคำขอฝากหิ้ว:', { ...requestForm, offerId: openRequestModal });
                setOpenRequestModal(null);
                setRequestForm({ image: '', itemName: '', weight: '', amount: '', note: '' });
                if (fileInputRef.current) fileInputRef.current.value = '';
                alert('ส่งคำขอฝากหิ้วสำเร็จ!');
              }}>
                <div className="mb-4">
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
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">ชื่อสินค้า</label>
                  <Input placeholder="ชื่อสินค้า" className="rounded-lg" value={requestForm.itemName} onChange={e => setRequestForm(f => ({ ...f, itemName: e.target.value }))} required />
                </div>
                <div className="mb-4 flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1">น้ำหนัก (กก.)</label>
                    <Input type="number" placeholder="น้ำหนัก (กก.)" className="rounded-lg" value={requestForm.weight} onChange={e => setRequestForm(f => ({ ...f, weight: e.target.value }))} required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1">จำนวน</label>
                    <Input type="number" placeholder="จำนวน" className="rounded-lg" value={requestForm.amount} onChange={e => setRequestForm(f => ({ ...f, amount: e.target.value }))} required />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-1">หมายเหตุ (ถ้ามี)</label>
                  <Textarea placeholder="หมายเหตุ (ถ้ามี)" className="rounded-lg" value={requestForm.note} onChange={e => setRequestForm(f => ({ ...f, note: e.target.value }))} />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-400 via-indigo-400 to-pink-400 text-white font-bold py-2 rounded-xl shadow hover:scale-105 transition">ส่งคำขอ</Button>
              </form>
            </DialogContent>
          </div>
        </Dialog>
      )}
    </div>
  );
}
