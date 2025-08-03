"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingBag, MapPin, Clock, DollarSign, Loader2, Image as ImageIcon, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { RequestForm } from "@/components/RequestForm";
import { useBackendToken } from "@/lib/useBackendToken";
import { toast } from "sonner";

export default function EditRequestPage() {
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
        console.log('Backend token:', backendToken ? 'exists' : 'missing');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/requests/${id}`, {
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
        console.log('Request data:', data);
        setForm({
          title: data.title || "",
          fromLocation: data.from_location || "",
          toLocation: data.to_location || "",
          deadline: data.deadline || "",
          budget: data.budget?.toString() || "",
          description: data.description || "",
          urgent: data.urgent === "true",
          imageFile: null,
        });
        
        if (data.image) {
          setImagePreview(data.image);
        }
      } catch (error) {
        console.error('Error fetching request:', error);
        toast.error('ไม่สามารถดึงข้อมูลได้');
        
        // Fallback: ใช้ข้อมูล mock สำหรับการทดสอบ
        console.log('Using fallback data for testing');
        setForm({
          title: "รายการฝากหิ้วทดสอบ",
          fromLocation: "ประเทศไทย",
          toLocation: "ประเทศญี่ปุ่น",
          deadline: "2025-01-15",
          budget: "5000",
          description: "รายการทดสอบสำหรับแก้ไข",
          urgent: false,
          imageFile: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, backendToken]);

  function validate() {
    const errs: any = {};
    if (!form.title) errs.title = "กรุณากรอกชื่อรายการ";
    if (!form.fromLocation) errs.fromLocation = "กรุณากรอกประเทศต้นทาง";
    if (!form.toLocation) errs.toLocation = "กรุณากรอกประเทศปลายทาง";
    if (!form.deadline) errs.deadline = "กรุณาเลือกวันที่ต้องการรับของ";
    if (!form.budget || isNaN(Number(form.budget))) errs.budget = "กรุณากรอกงบประมาณเป็นตัวเลข";
    if (form.imageFile && !form.imageFile.type.startsWith("image/")) {
      errs.imageFile = "กรุณาอัปโหลดไฟล์ภาพ (.jpg, .png, .webp)";
    }
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
        title: data.title,
        from_location: data.fromLocation,
        to_location: data.toLocation,
        deadline: data.deadline,
        budget: parseInt(data.budget),
        description: data.description,
        image: data.image || imagePreview,
        urgent: data.urgent ? "true" : "false",
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
        const errorData = await response.json();
        throw new Error(errorData.detail || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
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

  async function handleDelete() {
    if (!backendToken) {
      toast.error('กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/requests/${id}`, {
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
      console.error('Error deleting request:', error);
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
        <RequestForm
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