"use client";
import { ShoppingBag, CheckCircle, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useSession, signOut } from "next-auth/react";
import { mockRequests, mockOffers } from "@/lib/mockData";

export default function MyItemsPage() {
  const { data: session } = useSession();
  const [showDelete, setShowDelete] = useState<{ type: "request" | "offer"; id: number } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // filter & search logic (mock)
  const filteredRequests = mockRequests.filter(r =>
    (filter === "all" || r.status === filter) && r.title.includes(search)
  );
  const filteredOffers = mockOffers.filter(o =>
    (filter === "all" || o.status === filter) && o.route.includes(search)
  );

  function handleDelete() {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      setShowDelete(null);
      // TODO: remove from state
    }, 1000);
  }

  // pagination (mock)
  const pagedRequests = filteredRequests.slice((page-1)*pageSize, page*pageSize);
  const pagedOffers = filteredOffers.slice((page-1)*pageSize, page*pageSize);
  const totalPages = Math.max(
    Math.ceil(filteredRequests.length / pageSize),
    Math.ceil(filteredOffers.length / pageSize)
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-white py-10 px-2">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">รายการของฉัน</h1>
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6 sticky top-0 z-20 bg-gradient-to-br from-blue-100/80 via-indigo-100/80 to-white/80 py-2 px-2 rounded-xl shadow-sm">
            <input
              type="text"
              placeholder="ค้นหารายการ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white/80"
            />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white/80"
            >
              <option value="all">ทั้งหมด</option>
              <option value="รอรับหิ้ว">รอรับหิ้ว</option>
              <option value="สำเร็จ">สำเร็จ</option>
              <option value="เปิดรับฝาก">เปิดรับฝาก</option>
              <option value="ปิดรับฝาก">ปิดรับฝาก</option>
            </select>
          </div>
          {/* ฝากหิ้วของฉัน */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4 sticky top-14 z-10 bg-gradient-to-br from-blue-100/80 to-white/80 py-1 px-2 rounded-xl">
              <ShoppingBag className="h-5 w-5 text-blue-400" />
              <h2 className="text-base font-bold text-gray-800">ฝากหิ้วของฉัน</h2>
            </div>
            {pagedRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
                <span className="text-5xl mb-2">🛍️</span>
                <div className="text-gray-400 mb-2">ยังไม่มีรายการฝากหิ้ว</div>
              </div>
            ) : (
              <div className="grid gap-3">
                {pagedRequests.map(req => (
                  <div key={req.id} className="bg-white/90 rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-white/30 hover:shadow-xl hover:scale-[1.01] transition-all duration-200 animate-fade-in px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={req.image} alt={req.title} className="h-14 w-14 rounded-lg object-cover border border-gray-200 bg-white shadow-sm" />
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{req.title}</div>
                        <div className="text-xs text-gray-500 truncate flex items-center gap-2">
                          <Badge className={`px-2 py-0.5 text-xs rounded-full ${req.status === "สำเร็จ" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{req.status}</Badge>
                          {req.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 items-center">
                      <Link href={`/request/${req.id}/edit`}><Button size="icon" variant="outline" title="แก้ไข"><Edit2 className="h-4 w-4" /></Button></Link>
                      <Button size="icon" variant="destructive" title="ลบ" onClick={() => setShowDelete({ type: "request", id: req.id })}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          {/* ข้อเสนอรับหิ้วของฉัน */}
          <section>
            <div className="flex items-center gap-2 mb-4 sticky top-28 z-10 bg-gradient-to-br from-green-100/80 to-white/80 py-1 px-2 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <h2 className="text-base font-bold text-gray-800">ข้อเสนอรับหิ้วของฉัน</h2>
            </div>
            {pagedOffers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
                <span className="text-5xl mb-2">✈️</span>
                <div className="text-gray-400 mb-2">ยังไม่มีข้อเสนอรับหิ้ว</div>
              </div>
            ) : (
              <div className="grid gap-3">
                {pagedOffers.map(offer => (
                  <div key={offer.id} className="bg-white/90 rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-white/30 hover:shadow-xl hover:scale-[1.01] transition-all duration-200 animate-fade-in px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={offer.image} alt={offer.route} className="h-14 w-14 rounded-lg object-cover border border-gray-200 bg-white shadow-sm" />
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{offer.route}</div>
                        <div className="text-xs text-gray-500 truncate flex items-center gap-2">
                          <Badge className={`px-2 py-0.5 text-xs rounded-full ${offer.status === "เปิดรับฝาก" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{offer.status}</Badge>
                          {offer.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 items-center">
                      <Link href={`/offer/${offer.id}/edit`}><Button size="icon" variant="outline" title="แก้ไข"><Edit2 className="h-4 w-4" /></Button></Link>
                      <Button size="icon" variant="destructive" title="ลบ" onClick={() => setShowDelete({ type: "offer", id: offer.id })}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          {/* Pagination (mock) */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page-1)}>ก่อนหน้า</Button>
              <span className="text-sm text-gray-500 px-2">หน้า {page} / {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(page+1)}>ถัดไป</Button>
            </div>
          )}
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
    </>
  );
} 