"use client";
import { useState } from "react";
import { useRouteStore, Route } from "@/store/routeStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useSession, signOut } from "next-auth/react";

export default function MyRoutesPage() {
  const { data: session } = useSession();
  const { routes, addRoute, removeRoute } = useRouteStore();
  const [form, setForm] = useState<Route>({ from: "", to: "", date: "", maxWeight: 1, itemTypes: [] });
  const [itemTypeInput, setItemTypeInput] = useState("");

  function handleAddRoute() {
    if (!form.from || !form.to || !form.date) return;
    addRoute({ ...form, itemTypes: form.itemTypes.filter(Boolean) });
    setForm({ from: "", to: "", date: "", maxWeight: 1, itemTypes: [] });
    setItemTypeInput("");
  }

  return (
    <>
      <div className="max-w-xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">รอบเดินทางของฉัน</h1>
        <Card className="mb-6 p-4">
          <div className="flex gap-2 mb-2">
            <Input placeholder="ต้นทาง" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} />
            <Input placeholder="ปลายทาง" value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))} />
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="flex gap-2 mb-2">
            <Input type="number" min={1} placeholder="น้ำหนักสูงสุด (kg)" value={form.maxWeight} onChange={e => setForm(f => ({ ...f, maxWeight: Number(e.target.value) }))} />
            <Input placeholder="ประเภทของ (เช่น ขนม, เครื่องสำอาง)" value={itemTypeInput} onChange={e => setItemTypeInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && itemTypeInput) { setForm(f => ({ ...f, itemTypes: [...f.itemTypes, itemTypeInput] })); setItemTypeInput(""); } }} />
            <Button type="button" onClick={() => { if (itemTypeInput) { setForm(f => ({ ...f, itemTypes: [...f.itemTypes, itemTypeInput] })); setItemTypeInput(""); } }}>เพิ่มประเภท</Button>
          </div>
          <div className="flex gap-2 mb-2 flex-wrap">
            {form.itemTypes.map((type, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs">{type}</span>
            ))}
          </div>
          <Button onClick={handleAddRoute} className="mt-2">เพิ่มรอบเดินทาง</Button>
        </Card>
        <h2 className="text-lg font-semibold mb-2">รายการรอบเดินทาง</h2>
        <div className="space-y-3">
          {routes.length === 0 && <div className="text-gray-400">ยังไม่มีรอบเดินทาง</div>}
          {routes.map((route, idx) => (
            <Card key={idx} className="flex items-center justify-between p-4">
              <div>
                <div className="font-semibold">{route.from} → {route.to} ({route.date})</div>
                <div className="text-xs text-gray-500">น้ำหนักสูงสุด {route.maxWeight} kg | ประเภท: {route.itemTypes.join(", ") || "-"}</div>
              </div>
              <Button variant="destructive" size="sm" onClick={() => removeRoute(idx)}>ลบ</Button>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
} 