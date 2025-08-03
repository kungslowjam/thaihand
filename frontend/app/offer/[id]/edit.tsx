"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingBag, MapPin, Clock, DollarSign, Loader2, Image as ImageIcon, X, Plane } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { OfferForm } from "@/components/OfferForm";
import { useBackendToken } from "@/lib/useBackendToken";
import { toast } from "sonner";

export default function EditOfferPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { backendToken, loading: tokenLoading } = useBackendToken();
  
  const [form, setForm] = useState({
    routeFrom: "",
    routeTo: "",
    flightDate: "",
    closeDate: "",
    deliveryDate: "",
    rate: "",
    rates: [] as Array<{ weight: string; price: string }>,
    pickupPlace: "",
    itemTypes: [] as string[],
    restrictions: [] as string[],
    description: "",
    contact: "",
    urgent: false,
    imageFile: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ดึงข้อมูล Offer จาก backend
  useEffect(() => {
    if (!id || !backendToken) return;
    
    const fetchOffer = async () => {
      try {
        setLoading(true);
        console.log('Fetching offer with ID:', id);
        console.log('Backend token:', backendToken ? 'exists' : 'missing');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers/${id}`, {
          headers: {
            "Authorization": `Bearer ${backendToken}`
          }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          throw new Error(errorData.detail || 'ไม่สามารถดึงข้อมูลได้');
        }
        
        const data = await response.json();
        console.log('Offer data:', data);
        
        // แปลง rates จาก JSON string เป็น array
        let rates = [];
        try {
          rates = data.rates ? JSON.parse(data.rates) : [];
        } catch (e) {
          rates = [];
        }
        
        // แปลง item_types และ restrictions จาก JSON string เป็น array
        let itemTypes = [];
        let restrictions = [];
        try {
          itemTypes = data.item_types ? JSON.parse(data.item_types) : [];
          restrictions = data.restrictions ? JSON.parse(data.restrictions) : [];
        } catch (e) {
          itemTypes = [];
          restrictions = [];
        }
        
        setForm({
          routeFrom: data.route_from || "",
          routeTo: data.route_to || "",
          flightDate: data.flight_date || "",
          closeDate: data.close_date || "",
          deliveryDate: data.delivery_date || "",
          rate: "",
          rates: rates,
          pickupPlace: data.pickup_place || "",
          itemTypes: itemTypes,
          restrictions: restrictions,
          description: data.description || "",
          contact: data.contact || "",
          urgent: data.urgent === "true",
          imageFile: null,
        });
        
        if (data.image) {
          setImagePreview(data.image);
        }
      } catch (error) {
        console.error('Error fetching offer:', error);
        toast.error('ไม่สามารถดึงข้อมูลได้');
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id, backendToken]);

  // ฟังก์ชัน rates
  function handleRateChange(idx: number, field: 'weight' | 'price', value: string) {
    setForm(f => {
      const rates = [...f.rates];
      rates[idx][field] = value;
      return { ...f, rates };
    });
  }
  function addRate() {
    setForm(f => ({ ...f, rates: [...f.rates, { weight: "", price: "" }] }));
  }
  function removeRate(idx: number) {
    setForm(f => ({ ...f, rates: f.rates.filter((_, i) => i !== idx) }));
  }

  // multi-select
  const itemTypeOptions = [
    "วิตามิน", "Pandora", "เครื่องประดับ", "Brandname", "รองเท้า", "ของใช้", "อื่นๆ"
  ];
  function toggleItemType(type: string) {
    setForm(f => f.itemTypes.includes(type)
      ? { ...f, itemTypes: f.itemTypes.filter(t => t !== type) }
      : { ...f, itemTypes: [...f.itemTypes, type] });
  }
  const restrictionOptions = [
    "ไม่รับของผิดกฎหมาย", "ไม่รับของแตกหักง่าย", "ไม่รับของขนาดใหญ่", "ไม่รับของเสียภาษี/declare", "ขออนุญาตแกะของทุกชิ้น"
  ];
  function toggleRestriction(r: string) {
    setForm(f => f.restrictions.includes(r)
      ? { ...f, restrictions: f.restrictions.filter(t => t !== r) }
      : { ...f, restrictions: [...f.restrictions, r] });
  }

  function validate() {
    const errs: any = {};
    if (!form.routeFrom) errs.routeFrom = "กรุณากรอกประเทศต้นทาง";
    if (!form.routeTo) errs.routeTo = "กรุณากรอกประเทศปลายทาง";
    if (!form.flightDate) errs.flightDate = "กรุณาเลือกวันบิน";
    if (!form.closeDate) errs.closeDate = "กรุณาเลือกวันปิดรับของ";
    if (!form.deliveryDate) errs.deliveryDate = "กรุณาเลือกวันส่งของ";
    if (!form.rates.some(r => r.weight && r.price)) errs.rates = "กรุณากรอกเรตราคาอย่างน้อย 1 รายการ";
    if (!form.pickupPlace) errs.pickupPlace = "กรุณากรอกจุดนัดรับ";
    if (form.imageFile && !form.imageFile.type.startsWith("image/")) {
      errs.imageFile = "กรุณาอัปโหลดไฟล์ภาพ (.jpg, .png, .webp)";
    }
    if (!form.contact) errs.contact = "กรุณากรอกช่องทางติดต่อ";
    return errs;
  }

  function handleImageFileChange(e: any) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev: any) => {
        setImagePreview(ev.target.result);
        setForm(f => ({ ...f, imageFile: file }));
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
      setForm(f => ({ ...f, imageFile: null }));
    }
  }
  function handleRemoveImage() {
    setImagePreview("");
    setForm(f => ({ ...f, imageFile: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(data: any) {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!backendToken) {
      toast.error('กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        route_from: data.routeFrom,
        route_to: data.routeTo,
        flight_date: data.flightDate,
        close_date: data.closeDate,
        delivery_date: data.deliveryDate,
        rates: JSON.stringify(data.rates || []),
        pickup_place: data.pickupPlace,
        item_types: JSON.stringify(data.itemTypes || []),
        restrictions: JSON.stringify(data.restrictions || []),
        description: data.description,
        contact: data.contact,
        urgent: data.urgent ? "true" : "false",
        image: data.image || imagePreview,
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
        const errorData = await response.json();
        throw new Error(errorData.detail || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
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

  async function handleDelete() {
    if (!backendToken) {
      toast.error('กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${backendToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }

      toast.success('ลบข้อมูลสำเร็จ!');
      router.push("/dashboard");
    } catch (error: any) {
      console.error('Error deleting offer:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setDeleting(false);
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
      <div className="container mx-auto px-4 py-10 flex flex-col items-center">
        <OfferForm
          mode="edit"
          initialData={form}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          submitting={submitting}
          deleting={deleting}
        />
      </div>
    </div>
  );
} 