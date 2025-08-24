'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  ArrowLeft, 
  Package, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText, 
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Save,
  Sparkles
} from "lucide-react";
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
  const [isFormValid, setIsFormValid] = useState(false);

  // ตรวจสอบความถูกต้องของฟอร์ม
  useEffect(() => {
    const isValid = form.title && form.fromLocation && form.toLocation && form.deadline && form.budget;
    setIsFormValid(!!isValid);
  }, [form]);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <Package className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2 animate-pulse">กำลังโหลดข้อมูลคำขอ</h3>
          <p className="text-gray-500">กรุณารอสักครู่...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex items-center justify-center mb-6 animate-fade-in">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-4 animate-bounce">
                <Edit3 className="h-8 w-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">แก้ไขคำขอฝากหิ้ว</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto animate-fade-in-delay">
              ปรับปรุงรายละเอียดคำขอของคุณเพื่อให้ได้บริการที่ดีที่สุด
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="flex items-center">
                <div className="bg-green-500 text-white rounded-full p-2 animate-pulse">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600">ดึงข้อมูล</span>
              </div>
              <div className="h-px w-8 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="bg-blue-500 text-white rounded-full p-2 animate-pulse">
                  <Edit3 className="h-4 w-4" />
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">แก้ไขข้อมูล</span>
              </div>
              <div className="h-px w-8 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="bg-gray-300 text-gray-500 rounded-full p-2">
                  <Save className="h-4 w-4" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-400">บันทึก</span>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mb-6 animate-fade-in-up-delay">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="group hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              กลับไปหน้าก่อนหน้า
            </Button>
          </div>

          {/* Main Form Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-fade-in-up-delay-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-2 mr-4 animate-pulse">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-800">ข้อมูลคำขอ</CardTitle>
                  <p className="text-gray-600 mt-1">กรุณาตรวจสอบและแก้ไขข้อมูลให้ถูกต้อง</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title Section */}
                <div className="space-y-2 group">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700 flex items-center">
                    <Package className="h-4 w-4 mr-2 text-blue-500 group-hover:scale-110 transition-transform" />
                    ชื่อรายการ
                  </Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
                    placeholder="ระบุชื่อสินค้าหรือรายการที่ต้องการ"
                    required
                  />
                </div>

                {/* Location Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <Label htmlFor="fromLocation" className="text-sm font-medium text-gray-700 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-green-500 group-hover:scale-110 transition-transform" />
                      ประเทศต้นทาง
                    </Label>
                    <Input
                      id="fromLocation"
                      value={form.fromLocation}
                      onChange={(e) => setForm({ ...form, fromLocation: e.target.value })}
                      className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200 hover:shadow-md"
                      placeholder="เช่น ญี่ปุ่น, เกาหลี"
                      required
                    />
                  </div>
                  <div className="space-y-2 group">
                    <Label htmlFor="toLocation" className="text-sm font-medium text-gray-700 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-red-500 group-hover:scale-110 transition-transform" />
                      ประเทศปลายทาง
                    </Label>
                    <Input
                      id="toLocation"
                      value={form.toLocation}
                      onChange={(e) => setForm({ ...form, toLocation: e.target.value })}
                      className="h-12 border-gray-200 focus:border-red-500 focus:ring-red-500 transition-all duration-200 hover:shadow-md"
                      placeholder="เช่น ไทย"
                      required
                    />
                  </div>
                </div>

                {/* Date and Budget Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <Label htmlFor="deadline" className="text-sm font-medium text-gray-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-purple-500 group-hover:scale-110 transition-transform" />
                      วันที่ต้องการรับของ
                    </Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200 hover:shadow-md"
                      required
                    />
                  </div>
                  <div className="space-y-2 group">
                    <Label htmlFor="budget" className="text-sm font-medium text-gray-700 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-yellow-500 group-hover:scale-110 transition-transform" />
                      งบประมาณ (บาท)
                    </Label>
                    <Input
                      id="budget"
                      type="number"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      className="h-12 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 transition-all duration-200 hover:shadow-md"
                      placeholder="ระบุงบประมาณ"
                      required
                    />
                  </div>
                </div>

                {/* Description Section */}
                <div className="space-y-2 group">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-indigo-500 group-hover:scale-110 transition-transform" />
                    รายละเอียดเพิ่มเติม
                  </Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 resize-none hover:shadow-md"
                    placeholder="ระบุรายละเอียดเพิ่มเติม เช่น ขนาด, สี, ยี่ห้อ, หรือข้อกำหนดพิเศษ"
                  />
                </div>

                {/* Urgent Checkbox */}
                <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-all duration-200 group">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={form.urgent}
                    onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 transition-all duration-200"
                  />
                  <Label htmlFor="urgent" className="text-sm font-medium text-gray-700 flex items-center cursor-pointer">
                    <AlertTriangle className="h-4 w-4 mr-2 text-orange-500 group-hover:scale-110 transition-transform" />
                    ด่วน - ต้องการรับของเร็ว
                  </Label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <Button 
                    type="submit" 
                    disabled={submitting || !isFormValid}
                    className={`flex-1 h-12 font-medium transition-all duration-200 transform hover:scale-105 ${
                      isFormValid 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        บันทึกการแก้ไข
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    ยกเลิก
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.2s both;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-fade-in-up-delay {
          animation: fade-in-up 0.6s ease-out 0.1s both;
        }
        
        .animate-fade-in-up-delay-2 {
          animation: fade-in-up 0.6s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
} 