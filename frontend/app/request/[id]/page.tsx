'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { useBackendToken } from "@/lib/useBackendToken";
import { toast } from "sonner";

export default function RequestPage({ params }: { params: { id: string } }) {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { backendToken, loading: tokenLoading } = useBackendToken();
  
  const [form, setForm] = useState({
    title: "",
    fromLocation: "",
    toLocation: "",
    deadline: "",
    budget: "",
    description: "",
    urgent: false,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ดึงข้อมูล Request จาก backend
  useEffect(() => {
    if (!id || !backendToken) {
      console.log('Skipping fetchRequest: ID or backendToken missing', { id, backendToken: !!backendToken });
      return;
    }
    
    const fetchRequest = async () => {
      try {
        setLoading(true);
        console.log('Fetching request with ID:', id);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/requests/${id}`, {
          headers: {
            "Authorization": `Bearer ${backendToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลได้');
        }
        
        const data = await response.json();
        console.log('Request data:', data);
        setForm({
          title: data.title || "",
          fromLocation: data.from_location || "",
          toLocation: data.to_location || "",
          deadline: data.deadline || "",
          budget: data.budget?.toString() || "",
          description: data.description || "",
          urgent: data.urgent === "true",
        });
      } catch (error) {
        console.error('Error fetching request:', error);
        toast.error('ไม่สามารถดึงข้อมูลได้');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, backendToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!backendToken) {
      toast.error('กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        from_location: form.fromLocation,
        to_location: form.toLocation,
        deadline: form.deadline,
        budget: parseInt(form.budget),
        description: form.description,
        urgent: form.urgent ? "true" : "false",
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/requests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${backendToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
      }

      toast.success('อัปเดตข้อมูลสำเร็จ!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || tokenLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">แก้ไขคำขอฝากหิ้ว</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลคำขอ</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">ชื่อรายการ</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fromLocation">ประเทศต้นทาง</Label>
                    <Input
                      id="fromLocation"
                      value={form.fromLocation}
                      onChange={(e) => setForm({ ...form, fromLocation: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="toLocation">ประเทศปลายทาง</Label>
                    <Input
                      id="toLocation"
                      value={form.toLocation}
                      onChange={(e) => setForm({ ...form, toLocation: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deadline">วันที่ต้องการรับของ</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget">งบประมาณ (บาท)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">รายละเอียด</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={form.urgent}
                    onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
                  />
                  <Label htmlFor="urgent">ด่วน</Label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      'บันทึกการแก้ไข'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 