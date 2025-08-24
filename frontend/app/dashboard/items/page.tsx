"use client";
import { ShoppingBag, CheckCircle, Edit2, Trash2, Search, Filter, Plus, Calendar, MapPin, DollarSign, User, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";

// Helper function ดึงรหัสประเทศ
function getCountryCode(location: string) {
  if (!location) return "";
  const parts = location.split(",");
  return parts[parts.length - 1]?.trim().toLowerCase();
}

export default function MyItemsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [showDelete, setShowDelete] = useState<{ type: "request" | "offer"; id: number } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"requests" | "offers">("requests");
  const pageSize = 5;

  useEffect(() => {
    console.log("session", session); // log session
    const accessToken = (session as any)?.accessToken;
    let email = (session as any)?.user?.email;
    const provider = (session as any)?.provider || (session as any)?.user?.provider || "google";
    if (!email && provider === "line") {
      email = `${(session as any)?.user?.id}@line`;
    }
    console.log("accessToken", accessToken, "email", email); // log accessToken และ email
    if (accessToken && email) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/my-orders?email=${email}`, {
        headers: { "Authorization": `Bearer ${accessToken}` }
      })
        .then(res => res.json())
        .then(data => {
          console.log("my-orders", data);
          const arr = Array.isArray(data) ? data : data.detail;
          if (!Array.isArray(arr)) {
            console.error("API response ไม่ใช่ array", data);
            return;
          }
          const mapped = arr.map((item: any) => ({
            ...item,
            id: item.id || item.request_id || item._id,
            title: item.title || "รายการฝากหิ้ว",
            image: item.image || "/thaihand-logo.png",
            status: item.status || "รออนุมัติ",
            date: item.deadline || item.flight_date || item.date || "",
            user_id: item.user_id,
            offer_id: item.offer_id,
            // ตรวจสอบและแก้ไขข้อมูลที่ไม่สมเหตุสมผล
            budget: item.budget && item.budget > 0 ? item.budget : null,
            from_location: item.from_location || "ไม่ระบุ",
            to_location: item.to_location || "ไม่ระบุ",
            description: item.description || "ไม่มีรายละเอียดเพิ่มเติม"
          }));
          setRequests(mapped);
          console.log("DEBUG_MY_REQUESTS", mapped);
        });

      fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/my-carry-orders?email=${email}`, {
        headers: { "Authorization": `Bearer ${accessToken}` }
      })
        .then(res => res.json())
        .then(data => {
          console.log("my-carry-orders", data);
          const arr = Array.isArray(data) ? data : data.detail;
          if (!Array.isArray(arr)) {
            console.error("API response ไม่ใช่ array", data);
            return;
          }
          const mapped = arr.map((item: any) => ({
            ...item,
            id: item.id || item.offer_id || item._id,
            route: item.route || item.routeFrom || item.route_from || "ข้อเสนอรับหิ้ว",
            image: item.image || item.profile_image || "/thaihand-logo.png",
            status: item.status || "เปิดรับฝาก",
            date: item.flight_date || item.deadline || item.date || "",
            // ตรวจสอบและแก้ไขข้อมูลที่ไม่สมเหตุสมผล
            route_from: item.route_from || item.routeFrom || "ไม่ระบุ",
            route_to: item.route_to || item.routeTo || "ไม่ระบุ",
            description: item.description || "ไม่มีรายละเอียดเพิ่มเติม"
          }));
          setOffers(mapped);
        });

      // เพิ่ม fetch /api/offers เพื่อดึงข้อมูลเจ้าของ offer
      fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers`, {
        headers: { "Authorization": `Bearer ${accessToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (!Array.isArray(data)) {
            console.error("API /offers response ไม่ใช่ array", data);
            return;
          }
          setOffers(all => {
            // รวม offers จาก my-carry-orders และ /offers (กันกรณี id ซ้ำ)
            const allOffers = [...all, ...data.filter((o: any) => !all.some((a: any) => a.id === o.id))];
            return allOffers;
          });
        });
    }
  }, [session]);

  console.log("SESSION_USER", session?.user);
  const myId = String((session?.user as any)?.id || (session?.user as any)?.sub);
  let myEmail = session?.user?.email;
  const provider = (session as any)?.provider || (session as any)?.user?.provider || "google";
  if (!myEmail && provider === "line") {
    myEmail = `${session?.user?.id}@line`;
  }
  const myUserId = String((session?.user as any)?.id);
  console.log("myUserId", myUserId);
  const filteredRequests = requests.filter((r: any) =>
    (filter === "all" || r.status === filter) &&
    (r.title?.includes(search) || "")
  );
  const filteredOffers = offers.filter((o: any) =>
    (filter === "all" || o.status === filter) && ((o.route?.includes?.(search) || o.routeFrom?.includes?.(search) || o.routeTo?.includes?.(search)) || "")
  );
  const pagedRequests = filteredRequests.slice((page-1)*pageSize, page*pageSize);
  const pagedOffers = filteredOffers.slice((page-1)*pageSize, page*pageSize);
  const totalPages = Math.max(
    Math.ceil(filteredRequests.length / pageSize),
    Math.ceil(filteredOffers.length / pageSize)
  );

  console.log("requests", requests);
  console.log("filteredRequests", filteredRequests);
  console.log("pagedRequests", pagedRequests);
  pagedRequests.forEach(r => console.log("request", r.id, "user_id:", r.user_id, "offer_id:", r.offer_id));

  // แยกตาม source
  const fromMarketplace = pagedRequests.filter((r: any) => r.source === "marketplace");
  const fromCreateRequest = pagedRequests.filter((r: any) => r.source === "create-request");
  // รายการที่ฉันสร้างเอง (user_email == myEmail && !offer_id)
  const myOwnRequests = pagedRequests.filter((r: any) => r.user_email === myEmail && !r.offer_id);
  // รายการที่ฉันไปฝากกับคนอื่น (user_email == myEmail && offer_id != null)
  const myRequestsToOthers = pagedRequests.filter((r: any) => r.user_email === myEmail && r.offer_id);

  // สร้าง map offer_id -> offer object
  const offersById = Object.fromEntries(offers.map((o: any) => [o.id, o]));

  async function handleDelete() {
    if (!showDelete) return;
    setDeleting(true);
    const { type, id } = showDelete;
    const endpoint = type === "request"
              ? `${process.env.NEXT_PUBLIC_API_URL || '/api'}/requests/${id}`
        : `${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers/${id}`;
    const accessToken = (session as any)?.accessToken;
    const provider = (session as any)?.provider || (session as any)?.user?.provider || "google";
    let backendToken = accessToken;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, provider }),
      });
      const data = await res.json();
      if (data.accessToken) backendToken = data.accessToken;
    } catch (e) {}
    console.log("backendToken for delete", backendToken);
    fetch(endpoint, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${backendToken}`
      }
    })
      .then(res => {
        setDeleting(false);
        setShowDelete(null);
        if (res.ok) {
          if (type === "request") {
            setRequests(reqs => reqs.filter(r => r.id !== id));
          } else {
            setOffers(offers => offers.filter(o => o.id !== id));
          }
        } else {
          res.text().then(text => alert('ลบไม่สำเร็จ: ' + text));
        }
      });
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              รายการของฉัน
            </h1>
            <p className="text-gray-600 text-lg">จัดการรายการฝากหิ้วและข้อเสนอรับหิ้วของคุณ</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">รายการทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ข้อเสนอรับหิ้ว</p>
                  <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">รอรับหิ้ว</p>
                  <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === "รอรับหิ้ว").length}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">สำเร็จ</p>
                  <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === "สำเร็จ").length}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="ค้นหารายการ..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="รอรับหิ้ว">รอรับหิ้ว</option>
                  <option value="สำเร็จ">สำเร็จ</option>
                  <option value="เปิดรับฝาก">เปิดรับฝาก</option>
                  <option value="ปิดรับฝาก">ปิดรับฝาก</option>
                </select>
                <Button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  สร้างใหม่
                </Button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-2 mb-8">
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "requests"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ShoppingBag className="h-5 w-5 inline mr-2" />
              ฝากหิ้วของฉัน ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab("offers")}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "offers"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <CheckCircle className="h-5 w-5 inline mr-2" />
              ข้อเสนอรับหิ้ว ({offers.length})
            </button>
          </div>

          {/* Content Sections */}
          {activeTab === "requests" && (
            <div className="space-y-8">
              {/* รายการที่ฉันสร้างเอง */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">รายการที่ฉันสร้างเอง</h2>
                    <p className="text-gray-600">รายการฝากหิ้วที่คุณสร้างขึ้นมาเอง</p>
                  </div>
                </div>
                
                {myOwnRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีรายการ</h3>
                    <p className="text-gray-600 mb-4">เริ่มสร้างรายการฝากหิ้วแรกของคุณ</p>
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      สร้างรายการใหม่
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {myOwnRequests.map((req: any, index: number) => (
                      <div 
                        key={req.id} 
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            {/* Flags */}
                            <div className="flex items-center gap-2">
                              {req.from_location && (
                                <img
                                  src={`https://flagcdn.com/48x36/${getCountryCode(req.from_location)}.png`}
                                  alt={getCountryCode(req.from_location)}
                                  className="w-8 h-6 rounded shadow-sm"
                                  onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                                />
                              )}
                              <MapPin className="h-4 w-4 text-gray-400" />
                              {req.to_location && (
                                <img
                                  src={`https://flagcdn.com/48x36/${getCountryCode(req.to_location)}.png`}
                                  alt={getCountryCode(req.to_location)}
                                  className="w-8 h-6 rounded shadow-sm"
                                  onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                                />
                              )}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{req.title}</h3>
                                <Badge className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  req.status === "สำเร็จ" 
                                    ? "bg-emerald-100 text-emerald-700" 
                                    : "bg-blue-100 text-blue-700"
                                }`}>
                                  {req.status}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span>ต้นทาง: {req.from_location || 'ไม่ระบุ'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span>ปลายทาง: {req.to_location || 'ไม่ระบุ'}</span>
                                </div>
                                {req.budget && req.budget > 0 && (
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-gray-400" />
                                    <span>งบประมาณ: {req.budget.toLocaleString()} บาท</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span>วันที่: {req.date || 'ไม่ระบุ'}</span>
                                </div>
                              </div>
                              
                              {req.description && (
                                <p className="text-sm text-gray-500 mt-2 italic">"{req.description}"</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link href={`/request/${req.id}`}>
                              <Button variant="outline" size="sm" className="rounded-lg">
                                <Edit2 className="h-4 w-4 mr-2" />
                                แก้ไข
                              </Button>
                            </Link>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="rounded-lg"
                              onClick={() => setShowDelete({ type: "request", id: req.id })}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              ลบ
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* รายการที่ฉันไปฝากกับคนอื่น */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-100 rounded-xl">
                    <User className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">รายการที่ฉันไปฝากกับคนอื่น</h2>
                    <p className="text-gray-600">รายการฝากหิ้วที่คุณไปฝากกับผู้รับหิ้วคนอื่น</p>
                  </div>
                </div>
                
                {myRequestsToOthers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีรายการ</h3>
                    <p className="text-gray-600">คุณยังไม่ได้ไปฝากหิ้วกับใคร</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {myRequestsToOthers.map((req: any, index: number) => {
                      const carrierName = req.carrier_name || req.carrier_email || "-";
                      const carrierEmail = req.carrier_email || "-";
                      const carrierPhone = req.carrier_phone || "-";
                      const carrierImage = req.carrier_image || "/thaihand-logo.png";
                      
                      return (
                        <div 
                          key={req.id} 
                          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              {/* Flags */}
                              <div className="flex items-center gap-2">
                                {req.from_location && (
                                  <img
                                    src={`https://flagcdn.com/48x36/${getCountryCode(req.from_location)}.png`}
                                    alt={getCountryCode(req.from_location)}
                                    className="w-8 h-6 rounded shadow-sm"
                                    onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                                  />
                                )}
                                <MapPin className="h-4 w-4 text-gray-400" />
                                {req.to_location && (
                                  <img
                                    src={`https://flagcdn.com/48x36/${getCountryCode(req.to_location)}.png`}
                                    alt={getCountryCode(req.to_location)}
                                    className="w-8 h-6 rounded shadow-sm"
                                    onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                                  />
                                )}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">{req.title}</h3>
                                  <Badge className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    req.status === "สำเร็จ" 
                                      ? "bg-emerald-100 text-emerald-700" 
                                      : "bg-blue-100 text-blue-700"
                                  }`}>
                                    {req.status}
                                  </Badge>
                                </div>
                                
                                {/* Carrier Info */}
                                <div className="bg-white/50 rounded-lg p-3 mb-3">
                                  <div className="flex items-center gap-3 mb-2">
                                    <img 
                                      src={carrierImage} 
                                      alt="carrier" 
                                      className="w-8 h-8 rounded-full border-2 border-indigo-200" 
                                      onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }} 
                                    />
                                    <div>
                                      <p className="font-medium text-gray-900">{carrierName}</p>
                                      <p className="text-sm text-gray-600">{carrierEmail}</p>
                                    </div>
                                  </div>
                                  {carrierPhone && carrierPhone !== "-" && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Phone className="h-4 w-4" />
                                      <span>{carrierPhone}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>ต้นทาง: {req.from_location || 'ไม่ระบุ'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>ปลายทาง: {req.to_location || 'ไม่ระบุ'}</span>
                                  </div>
                                  {req.budget && req.budget > 0 && (
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4 text-gray-400" />
                                      <span>งบประมาณ: {req.budget.toLocaleString()} บาท</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>วันที่: {req.date || 'ไม่ระบุ'}</span>
                                  </div>
                                </div>
                                
                                {req.description && (
                                  <p className="text-sm text-gray-500 mt-2 italic">"{req.description}"</p>
                                )}
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex gap-2">
                              <Link href={`/request/${req.id}`}>
                                <Button variant="outline" size="sm" className="rounded-lg">
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  แก้ไข
                                </Button>
                              </Link>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="rounded-lg"
                                onClick={() => setShowDelete({ type: "request", id: req.id })}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                ลบ
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "offers" && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">ข้อเสนอรับหิ้วของฉัน</h2>
                  <p className="text-gray-600">ข้อเสนอรับหิ้วที่คุณสร้างขึ้นมา</p>
                </div>
              </div>
              
              {pagedOffers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีข้อเสนอ</h3>
                  <p className="text-gray-600 mb-4">เริ่มสร้างข้อเสนอรับหิ้วแรกของคุณ</p>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    สร้างข้อเสนอใหม่
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pagedOffers.map((offer, index) => (
                    <div 
                      key={offer.id} 
                      className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Flags */}
                          <div className="flex items-center gap-2">
                            {(offer.route_from || offer.routeFrom) && (
                              <img
                                src={`https://flagcdn.com/48x36/${getCountryCode(offer.route_from || offer.routeFrom)}.png`}
                                alt={getCountryCode(offer.route_from || offer.routeFrom)}
                                className="w-8 h-6 rounded shadow-sm"
                                onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                              />
                            )}
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {(offer.route_to || offer.routeTo) && (
                              <img
                                src={`https://flagcdn.com/48x36/${getCountryCode(offer.route_to || offer.routeTo)}.png`}
                                alt={getCountryCode(offer.route_to || offer.routeTo)}
                                className="w-8 h-6 rounded shadow-sm"
                                onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                              />
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{offer.route}</h3>
                              <Badge className={`px-3 py-1 rounded-full text-xs font-medium ${
                                offer.status === "เปิดรับฝาก" 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-gray-100 text-gray-500"
                              }`}>
                                {offer.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span>ต้นทาง: {offer.route_from || offer.routeFrom || 'ไม่ระบุ'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span>ปลายทาง: {offer.route_to || offer.routeTo || 'ไม่ระบุ'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>วันที่: {offer.date || 'ไม่ระบุ'}</span>
                              </div>
                            </div>
                            
                            {offer.description && (
                              <p className="text-sm text-gray-500 mt-2 italic">"{offer.description}"</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                          <Link href={`/my-routes/management/${offer.id}`}>
                            <Button variant="outline" size="sm" className="rounded-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6v-6l9.293-9.293a1 1 0 00-1.414-1.414L9 9.586V3H3v6h6v6H3v6z" />
                              </svg>
                              จัดการ
                            </Button>
                          </Link>
                          <Link href={`/offer/${offer.id}`}>
                            <Button variant="outline" size="sm" className="rounded-lg">
                              <Edit2 className="h-4 w-4 mr-2" />
                              แก้ไข
                            </Button>
                          </Link>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="rounded-lg"
                            onClick={() => setShowDelete({ type: "offer", id: offer.id })}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            ลบ
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button 
                size="sm" 
                variant="outline" 
                disabled={page === 1} 
                onClick={() => setPage(page-1)}
                className="rounded-lg"
              >
                ก่อนหน้า
              </Button>
              <span className="text-sm text-gray-500 px-4 py-2 bg-white/50 rounded-lg">หน้า {page} / {totalPages}</span>
              <Button 
                size="sm" 
                variant="outline" 
                disabled={page === totalPages} 
                onClick={() => setPage(page+1)}
                className="rounded-lg"
              >
                ถัดไป
              </Button>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDelete && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center border-t-4 border-red-200 animate-in zoom-in-95">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการลบ</h3>
                <p className="text-gray-600 mb-6">การลบรายการนี้ไม่สามารถย้อนกลับได้</p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete} 
                    disabled={deleting}
                    className="px-6 py-2 rounded-lg"
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        กำลังลบ...
                      </>
                    ) : (
                      'ยืนยัน'
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDelete(null)} 
                    disabled={deleting}
                    className="px-6 py-2 rounded-lg"
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 