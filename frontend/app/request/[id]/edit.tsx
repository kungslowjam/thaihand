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

export default function EditRequestPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  // mock fetch data
  const [form, setForm] = useState({
    title: "ขนมญี่ปุ่น",
    fromLocation: "Tokyo",
    toLocation: "Bangkok",
    deadline: "2024-07-20",
    budget: "1000",
    description: "ฝากซื้อขนมญี่ปุ่น",
    urgent: false,
    imageFile: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // TODO: fetch ข้อมูลจริงด้วย id แล้ว setForm
    // setImagePreview(...)
  }, [id]);

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

  function handleSubmit(data: any) {
    // TODO: ส่งข้อมูลไป backend หรือแสดง success
    // ตัวอย่าง: console.log('edit request', data)
  }
  function handleDelete() {
    // TODO: ลบข้อมูลและ redirect
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="container mx-auto px-4 py-10 flex flex-col items-center">
        <RequestForm
          mode="edit"
          initialData={form}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
} 