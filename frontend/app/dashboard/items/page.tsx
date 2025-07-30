"use client";
import { ShoppingBag, CheckCircle, Edit2, Trash2 } from "lucide-react";
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
            id: item.id || item.request_id || item._id, // ให้แน่ใจว่ามี id เสมอ
            title: item.title || (item.from_location && item.to_location ? `${item.from_location} → ${item.to_location}` : "รายการฝากหิ้ว"),
            image: item.image,
            status: item.status,
            date: item.deadline || item.flight_date || item.date || "",
            user_id: item.user_id, // เพิ่มบรรทัดนี้
            offer_id: item.offer_id, // เพิ่มบรรทัดนี้
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
            route: item.route || item.routeFrom || item.route_from || (item.routeFrom && item.routeTo ? `${item.routeFrom} → ${item.routeTo}` : (item.route_from && item.route_to ? `${item.route_from} → ${item.route_to}` : (item.from_location && item.to_location ? `${item.from_location} → ${item.to_location}` : "ข้อเสนอรับหิ้ว"))),
            image: item.image || item.profile_image || "/thaihand-logo.png",
            status: item.status || "เปิดรับฝาก",
            date: item.flight_date || item.deadline || item.date || "",
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
            {/* Section: รายการที่ฉันสร้างเอง */}
            <div className="mb-6">
              <h3 className="font-semibold text-blue-600 mb-2">รายการที่ฉันสร้างเอง</h3>
              {myOwnRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 animate-fade-in">
                  <span className="text-3xl mb-2">🛍️</span>
                  <div className="text-gray-400 mb-2">ยังไม่มีรายการที่ฉันสร้างเอง</div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {myOwnRequests.map((req: any) => (
                    <div key={req.id} className="bg-white/90 rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-white/30 hover:shadow-xl hover:scale-[1.01] transition-all duration-200 animate-fade-in px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* แสดงธงประเทศต้นทางและปลายทาง ถ้ามีข้อมูล */}
                        <div className="flex items-center gap-1 mr-2">
                          {req.from_location && <img
                            src={`https://flagcdn.com/48x36/${getCountryCode(req.from_location)}.png`}
                            alt={getCountryCode(req.from_location)}
                            className="w-7 h-7 rounded-full border shadow"
                            onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                          />}
                          <span className="mx-1">→</span>
                          {req.to_location && <img
                            src={`https://flagcdn.com/48x36/${getCountryCode(req.to_location)}.png`}
                            alt={getCountryCode(req.to_location)}
                            className="w-7 h-7 rounded-full border shadow"
                            onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                          />}
                        </div>
                        {/* รูปสินค้า (ถ้ามี) */}
                        <img
                          src={req.image || "/thaihand-logo.png"}
                          alt={req.title}
                          className="h-14 w-14 rounded-lg object-cover border border-gray-200 bg-white shadow-sm"
                          onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{req.title}</div>
                          <div className="text-xs text-gray-500 truncate flex items-center gap-2">
                            <Badge className={`px-2 py-0.5 text-xs rounded-full ${req.status === "สำเร็จ" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{req.status}</Badge>
                            {req.date}
                          </div>
                          {/* เพิ่มรายละเอียด */}
                          <div className="text-xs text-gray-600 mt-1">
                            <div>ต้นทาง: {req.from_location || '-'}</div>
                            <div>ปลายทาง: {req.to_location || '-'}</div>
                            <div>งบประมาณ: {req.budget ? `${req.budget} บาท` : '-'}</div>
                            <div>หมายเหตุ: {req.description || '-'}</div>
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
            </div>
            {/* Section: รายการที่ฉันไปฝากกับคนอื่น */}
            <div>
              <h3 className="font-semibold text-indigo-600 mb-2">รายการที่ฉันไปฝากกับคนอื่น</h3>
              {myRequestsToOthers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 animate-fade-in">
                  <span className="text-3xl mb-2">🛍️</span>
                  <div className="text-gray-400 mb-2">ยังไม่มีรายการที่ฉันไปฝากกับคนอื่น</div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {myRequestsToOthers.map((req: any) => {
                    const carrierName = req.carrier_name || req.carrier_email || "-";
                    const carrierEmail = req.carrier_email || "-";
                    const carrierPhone = req.carrier_phone || "-";
                    const carrierImage = req.carrier_image || "/thaihand-logo.png";
                    return (
                      <div key={req.id} className="bg-white/90 rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-white/30 hover:shadow-xl hover:scale-[1.01] transition-all duration-200 animate-fade-in px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* แสดงธงประเทศต้นทางและปลายทาง ถ้ามีข้อมูล */}
                          <div className="flex items-center gap-1 mr-2">
                            {req.from_location && <img
                              src={`https://flagcdn.com/48x36/${getCountryCode(req.from_location)}.png`}
                              alt={getCountryCode(req.from_location)}
                              className="w-7 h-7 rounded-full border shadow"
                              onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                            />}
                            <span className="mx-1">→</span>
                            {req.to_location && <img
                              src={`https://flagcdn.com/48x36/${getCountryCode(req.to_location)}.png`}
                              alt={getCountryCode(req.to_location)}
                              className="w-7 h-7 rounded-full border shadow"
                              onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                            />}
                          </div>
                          {/* รูปสินค้า (ถ้ามี) */}
                          <img
                            src={req.image || "/thaihand-logo.png"}
                            alt={req.title}
                            className="h-14 w-14 rounded-lg object-cover border border-gray-200 bg-white shadow-sm"
                            onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{req.title}</div>
                            <div className="text-xs text-gray-500 truncate flex items-center gap-2">
                              <Badge className={`px-2 py-0.5 text-xs rounded-full ${req.status === "สำเร็จ" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{req.status}</Badge>
                              {req.date}
                            </div>
                            {/* เพิ่มรายละเอียด */}
                            <div className="text-xs text-gray-600 mt-1">
                              <div className="flex items-center gap-2">
                                <span>ไปฝากกับ:</span>
                                <img src={carrierImage} alt="carrier" className="w-6 h-6 rounded-full border" onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }} />
                                <span>{carrierName}</span>
                                <span>({carrierEmail})</span>
                                {req.carrier_phone && <span>โทร: {carrierPhone}</span>}
                              </div>
                              <div>ต้นทาง: {req.from_location || '-'}</div>
                              <div>ปลายทาง: {req.to_location || '-'}</div>
                              <div>งบประมาณ: {req.budget ? `${req.budget} บาท` : '-'}</div>
                              <div>หมายเหตุ: {req.description || '-'}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 items-center">
                          <Link href={`/request/${req.id}/edit`}><Button size="icon" variant="outline" title="แก้ไข"><Edit2 className="h-4 w-4" /></Button></Link>
                          <Button size="icon" variant="destructive" title="ลบ" onClick={() => setShowDelete({ type: "request", id: req.id })}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
                      {/* แสดงธงประเทศต้นทาง → ปลายทาง */}
                      <div className="flex items-center gap-1 mr-2">
                        {((offer.route_from || offer.routeFrom) &&
                          <img
                            src={`https://flagcdn.com/48x36/${getCountryCode(offer.route_from || offer.routeFrom)}.png`}
                            alt={getCountryCode(offer.route_from || offer.routeFrom)}
                            className="w-7 h-7 rounded-full border shadow"
                            onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                          />)}
                        <span className="mx-1">→</span>
                        {((offer.route_to || offer.routeTo) &&
                          <img
                            src={`https://flagcdn.com/48x36/${getCountryCode(offer.route_to || offer.routeTo)}.png`}
                            alt={getCountryCode(offer.route_to || offer.routeTo)}
                            className="w-7 h-7 rounded-full border shadow"
                            onError={e => { e.currentTarget.src = "/thaihand-logo.png"; }}
                          />)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{offer.route}</div>
                        <div className="text-xs text-gray-500 truncate flex items-center gap-2">
                          <Badge className={`px-2 py-0.5 text-xs rounded-full ${offer.status === "เปิดรับฝาก" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{offer.status}</Badge>
                          {offer.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 items-center">
                      <Link href={`/my-routes/management/${offer.id}`}><Button size="icon" variant="outline" title="จัดการ"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6v-6l9.293-9.293a1 1 0 00-1.414-1.414L9 9.586V3H3v6h6v6H3v6z" /></svg></Button></Link>
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