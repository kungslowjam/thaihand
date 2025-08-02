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

export default function EditOfferPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  // mock fetch data
  const [form, setForm] = useState({
    routeFrom: "Melbourne",
    routeTo: "Bangkok",
    flightDate: "2024-07-17",
    closeDate: "2024-07-15",
    deliveryDate: "2024-07-18",
    rate: "0.5kg = 15 บาท, 1kg = 20 บาท",
    rates: [
      { weight: "0.5kg", price: "15" },
      { weight: "1kg", price: "20" }
    ],
    pickupPlace: "CBD, Melbourne Central",
    itemTypes: ["วิตามิน", "Brandname"],
    restrictions: ["ไม่รับของผิดกฎหมาย", "ไม่รับของแตกหักง่าย"],
    description: "หมายเหตุเพิ่มเติม",
    contact: "Line: yourlineid",
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

  function handleSubmit(data: any) {
    // TODO: ส่งข้อมูลไป backend หรือแสดง success
    // ตัวอย่าง: console.log('edit offer', data)
  }
  function handleDelete() {
    // TODO: ลบข้อมูลและ redirect
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="container mx-auto px-4 py-10 flex flex-col items-center">
        <OfferForm
          mode="edit"
          initialData={form}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
} 