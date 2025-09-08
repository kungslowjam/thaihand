"use client";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, CheckCircle, Search, BadgeDollarSign, Globe, BadgeCheck, SortAsc, Eye, Star, MessageCircle, X, Sparkles, Plus, Plane, MapPin, Calendar, Clock, TrendingUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { useUserStore } from '@/store/userStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRef } from 'react';
import { createPortal } from 'react-dom';

import Link from "next/link";
import { useBackendToken } from "@/lib/useBackendToken";

// เพิ่ม mock data สำหรับรับหิ้ว (offers)
// ลบ mockOffers

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
  const [openFilter, setOpenFilter] = useState(false);
  const [requestForm, setRequestForm] = useState({ image: '', itemName: '', weight: '', amount: '', note: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]); // ถ้ามี requests จริงให้เตรียมไว้ด้วย
  const { backendToken, loading: tokenLoading, error: tokenError } = useBackendToken();

  useEffect(() => {
    if (backendToken) {
      setLoading(true)
      fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers`, {
        headers: { "Authorization": `Bearer ${backendToken}` }
      })
        .then(res => res.json())
        .then(data => {
          setOffers(data); // ใช้ข้อมูลตรงจาก backend
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
        })
        .catch(error => {
          console.error('Error fetching requests:', error);
          setRequests([]);
        })
        .finally(() => setLoading(false));
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

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <main className="pt-24 max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-3" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              <li><Link href="/" className="hover:underline">หน้าแรก</Link></li>
              <li>/</li>
              <li className="text-gray-700 font-medium">Marketplace</li>
            </ol>
          </nav>
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Marketplace
            </h1>
            <p className="text-gray-600 text-lg">ค้นหาและเชื่อมต่อกับผู้รับหิ้วและผู้ฝากหิ้ว</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">รายการฝากหิ้ว</p>
                  <p className="text-2xl font-bold text-gray-900">{validRequests.length}</p>
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
                  <Clock className="h-6 w-6 text-yellow-600" />
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
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */
          }
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder={tab === "requests" ? "ค้นหาของฝาก..." : "ค้นหาเส้นทาง..."}
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterCountry}
                  onChange={e => { setFilterCountry(e.target.value); setPage(1); }}
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                >
                  <option value="">ทุกประเทศ</option>
                  <option value="Osaka">Osaka</option>
                  <option value="Sydney">Sydney</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                >
                  <option value="">ทุกสถานะ</option>
                  <option value="รอรับหิ้ว">รอรับหิ้ว</option>
                  <option value="สำเร็จ">สำเร็จ</option>
                </select>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                >
                  <option value="newest">ใหม่สุด</option>
                  <option value="lowestPrice">ราคาต่ำสุด</option>
                  <option value="nearestDate">ใกล้วันเดินทาง</option>
                </select>
                <Button variant="outline" onClick={() => setOpenFilter(true)} className="rounded-xl">
                  <Filter className="h-4 w-4 mr-2" /> ตัวกรองเพิ่มเติม
                </Button>
              </div>
            </div>
          </div>

          {/* Advanced Filter Slide-over */}
          <Dialog open={openFilter} onOpenChange={setOpenFilter}>
            <DialogContent className="fixed right-0 top-0 h-full w-full max-w-md rounded-none border-l p-6">
              <DialogTitle className="mb-4">ตัวกรองเพิ่มเติม</DialogTitle>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ช่วงราคา (บาท)</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="ต่ำสุด" className="w-full px-3 py-2 rounded-lg border" />
                    <input type="number" placeholder="สูงสุด" className="w-full px-3 py-2 rounded-lg border" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">วันที่บิน</label>
                  <input type="date" className="w-full px-3 py-2 rounded-lg border" />
                </div>
                <div className="flex items-center gap-2">
                  <input id="urgent" type="checkbox" className="h-4 w-4" />
                  <label htmlFor="urgent" className="text-sm">เฉพาะรายการด่วน</label>
                </div>
                <div className="pt-2 flex gap-2">
                  <Button onClick={() => setOpenFilter(false)} className="flex-1">นำไปใช้</Button>
                  <Button variant="outline" onClick={() => setOpenFilter(false)} className="flex-1">ปิด</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Tab Navigation */}
          <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-2 mb-8">
            <button
              onClick={() => { setTab("requests"); setPage(1); }}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                tab === "requests"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ShoppingBag className="h-5 w-5 inline mr-2" />
              ฝากหิ้ว ({validRequests.length})
            </button>
            <button
              onClick={() => { setTab("offers"); setPage(1); }}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                tab === "offers"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <CheckCircle className="h-5 w-5 inline mr-2" />
              รับหิ้ว ({offers.length})
            </button>
          </div>

          {/* Card Grid */}
          {loading ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-80 bg-white/90 rounded-2xl border animate-pulse" />
              ))}
            </div>
          ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center">
            {isRequestsTab ? (
              validRequests.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 animate-fade-in">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีรายการฝากหิ้ว</h3>
                  <p className="text-gray-600 mb-6 text-center">เริ่มฝากหิ้วของชิ้นแรกของคุณได้เลย!</p>
                  <Link href="/create-request">
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      สร้างรายการใหม่
                    </Button>
                  </Link>
                </div>
              ) : validRequests.map((req: any, index: number) => (
                <div 
                  key={req.id} 
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={req.image || "/thaihand-logo.png"} 
                      alt={req.routeFrom + " → " + req.routeTo} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    
                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {req.urgent && (
                        <Badge className="bg-gradient-to-r from-pink-400 to-red-500 text-white rounded-full px-3 py-1 text-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          ด่วน
                        </Badge>
                      )}
                      <button 
                        className="rounded-full bg-white/90 shadow-lg p-2 hover:bg-blue-100 transition-colors" 
                        title="บันทึกรายการ"
                        onClick={() => toggleBookmark(req.id)}
                      >
                        <Star className={`w-4 h-4 ${bookmarks.includes(req.id) ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                      </button>
                      <button 
                        className="rounded-full bg-white/90 shadow-lg p-2 hover:bg-green-100 transition-colors" 
                        title="ติดต่อ"
                      >
                        <MessageCircle className="w-4 h-4 text-green-500" />
                      </button>
                    </div>

                    {/* Route Flags */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      {req.routeFrom && (
                        <img
                          src={`https://flagcdn.com/48x36/${req.routeFrom.split(',').pop()?.trim().toLowerCase()}.png`}
                          alt=""
                          className="w-8 h-6 rounded shadow-lg"
                          onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                        />
                      )}
                      <MapPin className="h-4 w-4 text-white drop-shadow-lg" />
                      {req.routeTo && (
                        <img
                          src={`https://flagcdn.com/48x36/${req.routeTo.split(',').pop()?.trim().toLowerCase()}.png`}
                          alt=""
                          className="w-8 h-6 rounded shadow-lg"
                          onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    {/* Title */}
                    <div className="flex items-center gap-2 mb-3">
                      <Plane className="h-5 w-5 text-blue-500" />
                      <h3 className="font-bold text-lg text-gray-900 truncate">
                        {req.title || "สินค้าทั่วไป"}
                      </h3>
                    </div>

                    {/* Route */}
                    <div className="text-sm text-gray-600 mb-3">
                      {shortenLocation(req.routeFrom)} → {shortenLocation(req.routeTo)}
                    </div>

                    {/* Status Badge */}
                    <div className="flex gap-2 mb-3">
                      <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 text-xs rounded-full">
                        <ShoppingBag className="h-3 w-3 mr-1" />
                        ฝากหิ้ว
                      </Badge>
                      <Badge className={`px-3 py-1 text-xs rounded-full ${
                        req.status === "สำเร็จ" 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {req.status}
                      </Badge>
                    </div>

                    {/* Date & Price */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>บิน {req.flightDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>ปิดรับ {req.closeDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BadgeDollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 font-semibold text-lg">
                          {req.rates?.[0] ? `${req.rates[0].price} บาท/${req.rates[0].weight}` : "-"}
                        </span>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                        {req.user?.[0] ?? "U"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{req.user ?? "ผู้ใช้"}</p>
                        <p className="text-xs text-gray-500">ผู้ฝากหิ้ว</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link href="https://thaihand.shop/create-request?tab=offer">
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl py-3 font-semibold transition-all duration-200 hover:scale-105"
                      >
                        รับหิ้ว
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              paginatedOffers.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 animate-fade-in">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีรายการรับหิ้ว</h3>
                  <p className="text-gray-600 mb-6 text-center">ยังไม่มีรอบเดินทางรับหิ้วในขณะนี้</p>
                  <Link href="/my-routes">
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      สร้างข้อเสนอใหม่
                    </Button>
                  </Link>
                </div>
              ) : paginatedOffers.map((offer: any, index: number) => {
                const maxWeight = offer?.maxWeight || 10;
                const usedWeight = offer?.usedWeight || 0;
                const remainingWeight = maxWeight - usedWeight;
                
                return (
                  <div 
                    key={offer.id} 
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Header with Flags */}
                    <div className="p-6 pb-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          {(offer.routeFrom) && (
                            <img
                              src={`https://flagcdn.com/48x36/${offer.routeFrom.split(',').pop()?.trim().toLowerCase()}.png`}
                              alt=""
                              className="w-8 h-6 rounded shadow-lg"
                              onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                            />
                          )}
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {(offer.routeTo) && (
                            <img
                              src={`https://flagcdn.com/48x36/${offer.routeTo.split(',').pop()?.trim().toLowerCase()}.png`}
                              alt=""
                              className="w-8 h-6 rounded shadow-lg"
                              onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                            />
                          )}
                        </div>
                        {offer.urgent === "true" && (
                          <Badge className="bg-gradient-to-r from-pink-400 to-red-500 text-white rounded-full px-3 py-1 text-xs flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            ด่วน
                          </Badge>
                        )}
                      </div>

                      {/* Title & Route */}
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        {offer.title || "ข้อเสนอรับหิ้ว"}
                      </h3>
                      <div className="text-sm text-gray-600 mb-4">
                        {shortenLocation(offer.routeFrom)} → {shortenLocation(offer.routeTo)}
                      </div>

                      {/* Date Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>บิน {offer.flightDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>ปิดรับ {offer.closeDate}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <BadgeDollarSign className="h-5 w-5 text-green-500" />
                          <span className="text-green-600 font-bold text-xl">
                            {Array.isArray(offer.rates) && offer.rates.length > 0 && offer.rates[0].price
                              ? `${offer.rates[0].price} บาท/${offer.rates[0].weight}`
                              : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-400" />
                          <span>จุดนัดรับ: {offer.pickupPlace || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-green-400" />
                          <span>ติดต่อ: {offer.contact || "-"}</span>
                        </div>
                        {offer.description && (
                          <div className="flex items-start gap-2">
                            <span className="text-yellow-400 mt-1">📝</span>
                            <span className="text-xs">{offer.description}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <Link href="https://thaihand.shop/create-request?tab=request">
                        <Button 
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl py-3 font-semibold transition-all duration-200 hover:scale-105"
                        >
                          ฝากหิ้ว
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          )}

          {/* Pagination */}
          {Math.max(filteredRequests.length, filteredOffers.length) > pageSize && (
            <div className="flex justify-center gap-2 mt-8">
              <Button 
                size="sm" 
                variant="outline" 
                disabled={page === 1} 
                onClick={() => setPage(page - 1)}
                className="rounded-lg"
              >
                ก่อนหน้า
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600 bg-white/50 rounded-lg">
                หน้า {page} / {Math.ceil((isRequestsTab ? filteredRequests.length : filteredOffers.length) / pageSize)}
              </span>
              <Button 
                size="sm" 
                variant="outline" 
                disabled={page * pageSize >= (isRequestsTab ? filteredRequests.length : filteredOffers.length)} 
                onClick={() => setPage(page + 1)}
                className="rounded-lg"
              >
                ถัดไป
              </Button>
            </div>
          )}
        </main>

        {/* Floating Action Button */}
        <Link href="/create-request">
          <button className="fixed bottom-8 right-8 z-50 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-2xl p-4 hover:scale-110 transition-all duration-200 flex items-center gap-2 group" title="สร้างรายการใหม่">
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
            <span className="hidden md:inline font-semibold">สร้างรายการใหม่</span>
          </button>
        </Link>

        {/* Modal/Quick View */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative animate-fade-in border border-white/20">
              <button 
                className="absolute top-4 right-4 rounded-full bg-gray-100 hover:bg-red-100 p-2 transition-colors" 
                onClick={() => setSelectedRequest(null)}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
              <h2 className="text-xl font-bold mb-2 text-gray-900">{selectedRequest.title || "สินค้าทั่วไป"}</h2>
              <p className="text-sm text-gray-500 mb-2">{shortenLocation(selectedRequest.routeFrom)} → {shortenLocation(selectedRequest.routeTo)}</p>
              <img src={selectedRequest.image} className="w-full h-40 object-cover rounded-lg mb-3" />
              <div className="border-b border-gray-200 mb-3" />
              <div className="space-y-1">
                <p>บิน {selectedRequest.flightDate} • ปิดรับ {selectedRequest.closeDate}</p>
                <p>ราคา: <span className="font-semibold text-blue-700">{selectedRequest.rates[0].price} บาท/{selectedRequest.rates[0].weight}</span></p>
                <p>สถานะ: <span className="font-semibold">{selectedRequest.status}</span></p>
                <p>ผู้ใช้: <span className="font-semibold">{selectedRequest.user}</span></p>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="rounded-full bg-white/80 shadow p-2 hover:bg-green-100 transition-colors" title="ติดต่อ" onClick={() => alert(`ติดต่อ ${selectedRequest.user}`)}>
                  <MessageCircle className="w-5 h-5 text-green-400" />
                </button>
                <button className="rounded-full bg-white/80 shadow p-2 hover:bg-pink-100 transition-colors" title="บันทึกรายการ" onClick={() => toggleBookmark(selectedRequest.id)}>
                  <Star className={`w-5 h-5 ${bookmarks.includes(selectedRequest.id) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* เพิ่ม modal ฟอร์มรับหิ้ว */}
        {openRequestModal && typeof window !== 'undefined' && createPortal(
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)'
            }}
            onClick={() => setOpenRequestModal(null)}
          >
            <div 
              style={{
                position: 'relative',
                maxWidth: '28rem',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '1.5rem',
                padding: '2.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backdropFilter: 'blur(16px)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {tab === "requests" ? "รับหิ้วสินค้า" : "ฝากหิ้วสินค้า"}
                </h2>
                <button
                  className="absolute top-4 right-4 rounded-full bg-gray-100 hover:bg-red-100 p-2 transition-colors"
                  onClick={() => setOpenRequestModal(null)}
                  type="button"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
                <p className="text-sm text-gray-500 mb-6 text-center">
                  {tab === "requests" 
                    ? "กรุณากรอกข้อมูลสินค้าที่ต้องการรับหิ้ว" 
                    : "กรุณากรอกข้อมูลสินค้าที่ต้องการฝากหิ้ว"
                  }
                </p>
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
                      alert(tab === "requests" ? "ส่งคำขอรับหิ้วสำเร็จ!" : "ส่งคำขอฝากหิ้วสำเร็จ!");
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
                    <label className="block text-sm font-semibold mb-2 text-gray-700">รูปสินค้า</label>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      className="mb-2 rounded-xl border-2 border-gray-200 focus:border-blue-500" 
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => setRequestForm(f => ({ ...f, image: ev.target?.result as string }));
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                    {requestForm.image && (
                      <img src={requestForm.image} alt="preview" className="w-full h-32 object-cover rounded-xl border-2 border-gray-200 mb-2" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">ชื่อสินค้า</label>
                    <Input 
                      placeholder="เช่น ไดฟูกุ, ช็อกโกแลต, เสื้อผ้า" 
                      className="rounded-xl border-2 border-gray-200 focus:border-blue-500 px-4 py-3" 
                      value={requestForm.itemName} 
                      onChange={e => setRequestForm(f => ({ ...f, itemName: e.target.value }))} 
                      required 
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold mb-2 text-gray-700">น้ำหนัก (กก.)</label>
                      <Input 
                        type="number" 
                        placeholder="น้ำหนัก (กก.)" 
                        className="rounded-xl border-2 border-gray-200 focus:border-blue-500 px-4 py-3" 
                        value={requestForm.weight} 
                        onChange={e => setRequestForm(f => ({ ...f, weight: e.target.value }))} 
                        required 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold mb-2 text-gray-700">จำนวน</label>
                      <Input 
                        type="number" 
                        placeholder="จำนวน" 
                        className="rounded-xl border-2 border-gray-200 focus:border-blue-500 px-4 py-3" 
                        value={requestForm.amount} 
                        onChange={e => setRequestForm(f => ({ ...f, amount: e.target.value }))} 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">หมายเหตุ (ถ้ามี)</label>
                    <Textarea 
                      placeholder="หมายเหตุ (ถ้ามี)" 
                      className="rounded-xl border-2 border-gray-200 focus:border-blue-500 px-4 py-3" 
                      value={requestForm.note} 
                      onChange={e => setRequestForm(f => ({ ...f, note: e.target.value }))} 
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg text-lg hover:scale-105 transition-all duration-200"
                  >
                    {tab === "requests" ? "ส่งคำขอรับหิ้ว" : "ส่งคำขอฝากหิ้ว"}
                  </button>
                </form>
              </div>
            </div>,
            document.body
          )}

      </div>
    );
  } catch (error) {
    console.error('Error in MarketplacePage:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-6">ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }
}
