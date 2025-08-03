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

export default function OfferPage({ params }: { params: { id: string } }) {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { backendToken, loading: tokenLoading } = useBackendToken();
  
  const [form, setForm] = useState({
    route: "",
    routeFrom: "",
    routeTo: "",
    departureDate: "",
    returnDate: "",
    description: "",
    status: "เปิดรับฝาก",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ดึงข้อมูล Offer จาก backend
  useEffect(() => {
    if (!id || !backendToken) {
      console.log('Skipping fetchOffer: ID or backendToken missing', { id, backendToken: !!backendToken });
      return;
    }
    
    const fetchOffer = async () => {
      try {
        setLoading(true);
        console.log('Fetching offer with ID:', id);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers/${id}`, {
          headers: {
            "Authorization": `Bearer ${backendToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลได้');
        }
        
        const data = await response.json();
        console.log('Offer data:', data);
        setForm({
          route: data.route || "",
          routeFrom: data.route_from || "",
          routeTo: data.route_to || "",
          departureDate: data.departure_date || "",
          returnDate: data.return_date || "",
          description: data.description || "",
          status: data.status || "เปิดรับฝาก",
        });
      } catch (error) {
        console.error('Error fetching offer:', error);
        toast.error('ไม่สามารถดึงข้อมูลได้');
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
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
        route: form.route,
        route_from: form.routeFrom,
        route_to: form.routeTo,
        departure_date: form.departureDate,
        return_date: form.returnDate,
        description: form.description,
        status: form.status,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers/${id}`, {
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
      console.error('Error updating offer:', error);
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
            <h1 className="text-2xl font-bold text-gray-900">แก้ไขรอบเดินทาง</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลรอบเดินทาง</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="route">เส้นทาง</Label>
                  <Input
                    id="route"
                    value={form.route}
                    onChange={(e) => setForm({ ...form, route: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="routeFrom">ประเทศต้นทาง</Label>
                    <Input
                      id="routeFrom"
                      value={form.routeFrom}
                      onChange={(e) => setForm({ ...form, routeFrom: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="routeTo">ประเทศปลายทาง</Label>
                    <Input
                      id="routeTo"
                      value={form.routeTo}
                      onChange={(e) => setForm({ ...form, routeTo: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departureDate">วันที่ออกเดินทาง</Label>
                    <Input
                      id="departureDate"
                      type="date"
                      value={form.departureDate}
                      onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="returnDate">วันที่กลับ</Label>
                    <Input
                      id="returnDate"
                      type="date"
                      value={form.returnDate}
                      onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
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

                <div>
                  <Label htmlFor="status">สถานะ</Label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="เปิดรับฝาก">เปิดรับฝาก</option>
                    <option value="ปิดรับฝาก">ปิดรับฝาก</option>
                  </select>
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