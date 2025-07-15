"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimpleNavigation } from "@/components/simple-navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingBag, MapPin, Clock, DollarSign, Loader2, Image as ImageIcon, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

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

  async function handleSubmit(e: any) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      // redirect หรือแจ้งเตือน
    }, 1200); // mock submit
  }

  async function handleDelete() {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      setShowDelete(false);
      router.push("/dashboard"); // redirect หลังลบ
    }, 1200); // mock delete
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <SimpleNavigation user={session?.user ? { name: session.user.name ?? "", avatar: session.user.image ?? undefined } : undefined} onLogout={() => signOut()} />
      <div className="container mx-auto px-4 py-10 flex flex-col items-center">
        <Card className="max-w-lg w-full mx-auto p-8 rounded-3xl shadow-2xl bg-white/70 backdrop-blur-md mt-8">
          <CardContent className="p-0">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
              <ShoppingBag className="h-6 w-6 text-blue-500" /> แก้ไขคำขอฝากหิ้ว
            </h2>
            {success && (
              <div className="mb-6">
                <Badge className="bg-green-100 text-green-700 px-4 py-2 text-base">บันทึกสำเร็จ!</Badge>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="title">ชื่อรายการ *</Label>
                <div className="relative mt-1">
                  <Input id="title" placeholder="เช่น ขนมญี่ปุ่น" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={errors.title ? 'border-red-400' : ''} />
                  <ShoppingBag className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                </div>
                {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
              </div>
              {/* รูปภาพ */}
              <div>
                <Label>รูปภาพสินค้า (อัปโหลดไฟล์)</Label>
                <div className="flex gap-2 items-center mt-1">
                  <Button type="button" variant="outline" className="flex items-center gap-1 px-3 py-2" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon className="h-4 w-4" /> อัปโหลด
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />
                </div>
                {errors.imageFile && <div className="text-red-500 text-sm mt-1">{errors.imageFile}</div>}
                {imagePreview && (
                  <div className="relative mt-3 w-32 h-32 rounded-xl overflow-hidden border bg-gray-50 flex items-center justify-center">
                    <img src={imagePreview} alt="preview" className="object-contain w-full h-full" />
                    <Button type="button" size="icon" variant="ghost" className="absolute top-1 right-1 bg-white/80" onClick={handleRemoveImage}>
                      <X className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="fromLocation">ประเทศต้นทาง *</Label>
                  <div className="relative mt-1">
                    <Input id="fromLocation" placeholder="ประเทศต้นทาง" value={form.fromLocation} onChange={e => setForm(f => ({ ...f, fromLocation: e.target.value }))} className={errors.fromLocation ? 'border-red-400' : ''} />
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  </div>
                  {errors.fromLocation && <div className="text-red-500 text-sm mt-1">{errors.fromLocation}</div>}
                </div>
                <div className="flex-1">
                  <Label htmlFor="toLocation">ประเทศปลายทาง *</Label>
                  <div className="relative mt-1">
                    <Input id="toLocation" placeholder="ประเทศปลายทาง" value={form.toLocation} onChange={e => setForm(f => ({ ...f, toLocation: e.target.value }))} className={errors.toLocation ? 'border-red-400' : ''} />
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  </div>
                  {errors.toLocation && <div className="text-red-500 text-sm mt-1">{errors.toLocation}</div>}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="deadline">วันที่ต้องการรับของ *</Label>
                  <div className="relative mt-1">
                    <Input id="deadline" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className={errors.deadline ? 'border-red-400' : ''} />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  </div>
                  {errors.deadline && <div className="text-red-500 text-sm mt-1">{errors.deadline}</div>}
                </div>
                <div className="flex-1">
                  <Label htmlFor="budget">งบประมาณ (บาท) *</Label>
                  <div className="relative mt-1">
                    <Input id="budget" type="number" placeholder="เช่น 1000" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className={errors.budget ? 'border-red-400' : ''} />
                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  </div>
                  {errors.budget && <div className="text-red-500 text-sm mt-1">{errors.budget}</div>}
                </div>
              </div>
              <div>
                <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
                <Textarea id="description" placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="urgent" checked={form.urgent} onChange={e => setForm(f => ({ ...f, urgent: e.target.checked }))} className="accent-red-500 h-4 w-4" />
                <Label htmlFor="urgent" className="text-red-500">ต้องการด่วน</Label>
              </div>
              <div className="flex gap-2 mt-6">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2" disabled={submitting}>
                  {submitting && <Loader2 className="animate-spin h-5 w-5" />} บันทึก
                </Button>
                <Button type="button" variant="destructive" onClick={() => setShowDelete(true)}>ลบ</Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>ยกเลิก</Button>
              </div>
            </form>
            {/* Modal ยืนยันลบ */}
            {showDelete && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xs w-full text-center">
                  <div className="text-lg font-semibold mb-4">ยืนยันการลบรายการนี้?</div>
                  <div className="flex gap-2 justify-center mt-4">
                    <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                      {deleting && <Loader2 className="animate-spin h-4 w-4 mr-2" />} ยืนยัน
                    </Button>
                    <Button variant="outline" onClick={() => setShowDelete(false)} disabled={deleting}>ยกเลิก</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 