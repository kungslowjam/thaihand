"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";

export default function EditRequestPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [form, setForm] = useState({
    title: "ขนมญี่ปุ่น",
    fromLocation: "Tokyo",
    toLocation: "Bangkok",
    deadline: "2024-07-20",
    budget: "1000",
    description: "ฝากซื้อขนมญี่ปุ่น",
  });

  useEffect(() => {
    // TODO: fetch ข้อมูลจริงด้วย id แล้ว setForm
  }, [id]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: ส่งข้อมูลไป backend
    console.log('edit request', form);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="container mx-auto px-4 py-10 max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">แก้ไขรายการฝากหิ้ว</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">ชื่อรายการ</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="fromLocation">ประเทศต้นทาง</Label>
            <Input
              id="fromLocation"
              value={form.fromLocation}
              onChange={(e) => setForm({...form, fromLocation: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="toLocation">ประเทศปลายทาง</Label>
            <Input
              id="toLocation"
              value={form.toLocation}
              onChange={(e) => setForm({...form, toLocation: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="deadline">วันที่ต้องการรับของ</Label>
            <Input
              id="deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({...form, deadline: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="budget">งบประมาณ (บาท)</Label>
            <Input
              id="budget"
              type="number"
              value={form.budget}
              onChange={(e) => setForm({...form, budget: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">รายละเอียด</Label>
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