"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";

export default function EditOfferPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [form, setForm] = useState({
    routeFrom: "Melbourne",
    routeTo: "Bangkok",
    flightDate: "2024-07-17",
    closeDate: "2024-07-15",
    deliveryDate: "2024-07-18",
    pickupPlace: "CBD, Melbourne Central",
    description: "หมายเหตุเพิ่มเติม",
    contact: "Line: yourlineid",
  });

  useEffect(() => {
    // TODO: fetch ข้อมูลจริงด้วย id แล้ว setForm
  }, [id]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: ส่งข้อมูลไป backend
    console.log('edit offer', form);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="container mx-auto px-4 py-10 max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">แก้ไขรายการรับหิ้ว</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="routeFrom">ประเทศต้นทาง</Label>
            <Input
              id="routeFrom"
              value={form.routeFrom}
              onChange={(e) => setForm({...form, routeFrom: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="routeTo">ประเทศปลายทาง</Label>
            <Input
              id="routeTo"
              value={form.routeTo}
              onChange={(e) => setForm({...form, routeTo: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="flightDate">วันบิน</Label>
            <Input
              id="flightDate"
              type="date"
              value={form.flightDate}
              onChange={(e) => setForm({...form, flightDate: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="closeDate">วันปิดรับของ</Label>
            <Input
              id="closeDate"
              type="date"
              value={form.closeDate}
              onChange={(e) => setForm({...form, closeDate: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="deliveryDate">วันส่งของ</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={form.deliveryDate}
              onChange={(e) => setForm({...form, deliveryDate: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="pickupPlace">จุดนัดรับ</Label>
            <Input
              id="pickupPlace"
              value={form.pickupPlace}
              onChange={(e) => setForm({...form, pickupPlace: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="contact">ช่องทางติดต่อ</Label>
            <Input
              id="contact"
              value={form.contact}
              onChange={(e) => setForm({...form, contact: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">หมายเหตุ</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              บันทึกการแก้ไข
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              ยกเลิก
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 