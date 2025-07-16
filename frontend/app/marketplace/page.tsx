"use client";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, CheckCircle, Search, BadgeDollarSign, Globe, BadgeCheck, SortAsc, Eye, Star, MessageCircle, X, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession, signOut } from "next-auth/react";
import { SimpleNavigation } from "@/components/simple-navigation";

const mockRequests = [
  { id: 1, title: "ขนมญี่ปุ่น", from: "Osaka", to: "Bangkok", price: 250, status: "รอรับหิ้ว", date: "2024-07-10", user: "Aom", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=facearea&w=400&q=80", isNew: true, isHot: false },
  { id: 2, title: "วิตามินออสเตรเลีย", from: "Sydney", to: "Bangkok", price: 400, status: "สำเร็จ", date: "2024-07-01", user: "Bee", image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=facearea&w=400&q=80", isNew: false, isHot: true },
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
  const paginatedRequests = filteredRequests.slice((page - 1) * pageSize, page * pageSize);

  const columns = useGridColumns();
  const rowCount = useMemo(() => Math.ceil(paginatedRequests.length / columns), [paginatedRequests.length, columns]);

  function toggleBookmark(id: number) {
    setBookmarks(bm => bm.includes(id) ? bm.filter(i => i !== id) : [...bm, id]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <SimpleNavigation
        user={session?.user ? { name: session.user.name ?? "", avatar: session.user.image ?? undefined } : undefined}
        onLogout={() => signOut()}
      />
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
          {paginatedRequests.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 animate-fade-in">
              <span className="text-5xl mb-2">🛍️</span>
              <h3 className="text-lg font-semibold text-gray-500 mb-2">ยังไม่มีรายการฝากหิ้ว</h3>
              <p className="text-gray-400 mb-4">เริ่มฝากหิ้วของชิ้นแรกของคุณได้เลย!</p>
            </div>
          ) : paginatedRequests.map(req => (
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
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8 gap-2">
          <Button size="sm" variant="outline" className="px-3 py-1 text-xs" disabled={page === 1} onClick={() => setPage(page - 1)}>ก่อนหน้า</Button>
          <span className="mx-2 text-xs">หน้า {page}</span>
          <Button size="sm" variant="outline" className="px-3 py-1 text-xs" disabled={page * pageSize >= filteredRequests.length} onClick={() => setPage(page + 1)}>ถัดไป</Button>
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
    </div>
  );
}
