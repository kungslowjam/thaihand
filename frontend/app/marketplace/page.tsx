"use client";
import { useState } from "react";
import { ShoppingBag, CheckCircle, Search, BadgeDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession, signOut } from "next-auth/react";
import { SimpleNavigation } from "@/components/simple-navigation";

const mockRequests = [
  { id: 1, title: "ขนมญี่ปุ่น", from: "Osaka", to: "Bangkok", price: 250, status: "รอรับหิ้ว", date: "2024-07-10", user: "Aom" },
  { id: 2, title: "วิตามินออสเตรเลีย", from: "Sydney", to: "Bangkok", price: 400, status: "สำเร็จ", date: "2024-07-01", user: "Bee" },
];
const mockOffers = [
  { id: 1, route: "Melbourne → BKK", price: 300, status: "เปิดรับฝาก", date: "2024-07-15", user: "Tom" },
  { id: 2, route: "BKK → Tokyo", price: 350, status: "ปิดรับฝาก", date: "2024-06-20", user: "Mew" },
];

export default function MarketplacePage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<"requests" | "offers">("requests");
  const [search, setSearch] = useState("");

  // filter logic (mock)
  const filteredRequests = mockRequests.filter(r => r.title.includes(search) || r.from.includes(search) || r.to.includes(search));
  const filteredOffers = mockOffers.filter(o => o.route.includes(search));

  return (
    <>
      <SimpleNavigation user={session?.user ? { name: session.user.name ?? "", avatar: session.user.image ?? undefined } : undefined} onLogout={() => signOut()} />
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-white px-2">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-400 bg-clip-text text-transparent mb-8 text-center tracking-tight">Marketplace</h1>
          {/* Toggle Tab */}
          <div className="flex justify-center gap-2 mb-6 animate-fade-in">
            <Button variant={tab === "requests" ? "default" : "outline"} className={`rounded-full px-6 transition-all duration-200 ${tab === "requests" ? "scale-105 shadow-md" : ""}`} onClick={() => setTab("requests")}>ฝากหิ้ว</Button>
            <Button variant={tab === "offers" ? "default" : "outline"} className={`rounded-full px-6 transition-all duration-200 ${tab === "offers" ? "scale-105 shadow-md" : ""}`} onClick={() => setTab("offers")}>รับหิ้ว</Button>
          </div>
          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-8 bg-white/70 rounded-xl px-4 py-2 shadow-sm">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={tab === "requests" ? "ค้นหาของฝาก..." : "ค้นหาเส้นทาง..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none px-2 py-1 text-sm"
            />
          </div>
          {/* Content */}
          {tab === "requests" ? (
            filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                <span className="text-5xl mb-2">🛍️</span>
                <h3 className="text-lg font-semibold text-gray-500 mb-2">ยังไม่มีรายการฝากหิ้ว</h3>
                <p className="text-gray-400 mb-4">เริ่มฝากหิ้วของชิ้นแรกของคุณได้เลย!</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                {filteredRequests.map(req => (
                  <div key={req.id} className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-7 flex flex-col gap-3 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 animate-fade-in relative overflow-hidden">
                    {/* floating icon */}
                    <ShoppingBag className="absolute -top-5 -right-5 h-16 w-16 text-blue-100 opacity-30 z-0" />
                    <div className="flex items-center gap-2 mb-1 z-10">
                      <ShoppingBag className="h-5 w-5 text-blue-400" />
                      <span className="font-bold text-gray-900 text-base truncate">{req.title}</span>
                      <Badge className="bg-gradient-to-r from-blue-200 to-blue-400 text-blue-800 px-2 py-0.5 text-xs rounded-full ml-2 flex items-center gap-1"><ShoppingBag className="h-3 w-3 mr-1" /> ฝากหิ้ว</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mb-1 z-10">{req.from} → {req.to} • {req.date}</div>
                    <div className="flex items-center gap-2 text-sm z-10">
                      <BadgeDollarSign className="h-4 w-4 text-green-400" />
                      <span className="font-semibold text-green-700">{req.price} บาท</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 z-10">
                      <span>โดย {req.user}</span>
                      <Badge className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${req.status === "สำเร็จ" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{req.status === "สำเร็จ" ? <span className='mr-1'>✔️</span> : <span className='mr-1'>⏳</span>}{req.status}</Badge>
                    </div>
                    <div className="flex gap-2 mt-3 z-10">
                      <Button size="sm" className="rounded-xl px-5 font-semibold bg-gradient-to-r from-blue-400 via-indigo-400 to-pink-400 text-white shadow hover:scale-105 hover:shadow-xl transition flex items-center gap-2"><span>ดูรายละเอียด</span></Button>
                      <Button size="sm" variant="outline" className="rounded-xl px-5 font-semibold shadow hover:bg-blue-50/60 hover:scale-105 transition flex items-center gap-2"><span>ขอรับหิ้ว</span></Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            filteredOffers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                <span className="text-5xl mb-2">✈️</span>
                <h3 className="text-lg font-semibold text-gray-500 mb-2">ยังไม่มีข้อเสนอรับหิ้ว</h3>
                <p className="text-gray-400 mb-4">เริ่มสร้างข้อเสนอรับหิ้วของคุณได้เลย!</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                {filteredOffers.map(offer => (
                  <div key={offer.id} className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-7 flex flex-col gap-3 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 animate-fade-in relative overflow-hidden">
                    {/* floating icon */}
                    <CheckCircle className="absolute -top-5 -right-5 h-16 w-16 text-green-100 opacity-30 z-0" />
                    <div className="flex items-center gap-2 mb-1 z-10">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="font-bold text-gray-900 text-base truncate">{offer.route}</span>
                      <Badge className="bg-gradient-to-r from-green-200 to-green-400 text-green-800 px-2 py-0.5 text-xs rounded-full ml-2 flex items-center gap-1"><CheckCircle className="h-3 w-3 mr-1" /> รับหิ้ว</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mb-1 z-10">{offer.date}</div>
                    <div className="flex items-center gap-2 text-sm z-10">
                      <BadgeDollarSign className="h-4 w-4 text-green-400" />
                      <span className="font-semibold text-green-700">{offer.price} บาท</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 z-10">
                      <span>โดย {offer.user}</span>
                      <Badge className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${offer.status === "เปิดรับฝาก" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{offer.status === "เปิดรับฝาก" ? <span className='mr-1'>🟢</span> : <span className='mr-1'>⏸️</span>}{offer.status}</Badge>
                    </div>
                    <div className="flex gap-2 mt-3 z-10">
                      <Button size="sm" className="rounded-xl px-5 font-semibold bg-gradient-to-r from-green-400 via-blue-400 to-pink-400 text-white shadow hover:scale-105 hover:shadow-xl transition flex items-center gap-2"><span>ดูรายละเอียด</span></Button>
                      <Button size="sm" variant="outline" className="rounded-xl px-5 font-semibold shadow hover:bg-green-50/60 hover:scale-105 transition flex items-center gap-2"><span>ฝากของ</span></Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
