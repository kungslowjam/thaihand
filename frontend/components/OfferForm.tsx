import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Loader2, Image as ImageIcon, X, Plane } from "lucide-react";

export interface OfferFormProps {
  initialData?: {
    routeFrom: string;
    routeTo: string;
    flightDate: string;
    closeDate: string;
    deliveryDate: string;
    rates: { weight: string; price: string }[];
    pickupPlace: string;
    itemTypes: string[];
    description: string;
    restrictions: string[];
    contact: string;
    urgent: boolean;
    imageFile: File | null;
  };
  mode?: 'create' | 'edit';
  onSubmit: (data: any) => void;
  onDelete?: () => void;
}

export function OfferForm({ initialData, mode = 'create', onSubmit, onDelete }: OfferFormProps) {
  const [form, setForm] = useState(initialData || {
    routeFrom: "",
    routeTo: "",
    flightDate: "",
    closeDate: "",
    deliveryDate: "",
    rates: [{ weight: "", price: "" }],
    pickupPlace: "",
    itemTypes: [] as string[],
    description: "",
    restrictions: [] as string[],
    contact: "",
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

  function validate() {
    const errs: any = {};
    if (!form.routeFrom) errs.routeFrom = "กรุณากรอกต้นทาง";
    if (!form.routeTo) errs.routeTo = "กรุณากรอกปลายทาง";
    if (!form.flightDate) errs.flightDate = "กรุณาเลือกวันบิน";
    if (!form.closeDate) errs.closeDate = "กรุณาเลือกวันปิดรับของ";
    if (!form.deliveryDate) errs.deliveryDate = "กรุณาเลือกวันส่งของ";
    if (!form.rates.some(r => r.weight && r.price)) errs.rates = "กรุณากรอกเรตราคาขั้นต่ำ 1 รายการ";
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

  async function handleSubmit(e: any) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      onSubmit(form);
    }, 1200);
  }

  async function handleDelete() {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      setShowDelete(false);
      onDelete && onDelete();
    }, 1200);
  }

  return (
    <Card className="max-w-lg w-full mx-auto p-8 rounded-3xl shadow-2xl bg-white/70 backdrop-blur-md mt-8">
      <CardContent className="p-0">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
          <Plane className="h-6 w-6 text-indigo-500" /> {mode === 'edit' ? 'แก้ไขเที่ยวบิน/รอบเดินทาง' : 'สร้างเที่ยวบิน/รอบเดินทาง'}
        </h2>
        {success && (
          <div className="mb-6">
            <Badge className="bg-green-100 text-green-700 px-4 py-2 text-base">บันทึกสำเร็จ!</Badge>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>ต้นทาง *</Label>
              <Input placeholder="เช่น MEL" value={form.routeFrom} onChange={e => setForm(f => ({ ...f, routeFrom: e.target.value }))} className={errors.routeFrom ? 'border-red-400' : ''} />
              {errors.routeFrom && <div className="text-red-500 text-sm mt-1">{errors.routeFrom}</div>}
            </div>
            <div className="flex items-center px-2">→</div>
            <div className="flex-1">
              <Label>ปลายทาง *</Label>
              <Input placeholder="เช่น BKK" value={form.routeTo} onChange={e => setForm(f => ({ ...f, routeTo: e.target.value }))} className={errors.routeTo ? 'border-red-400' : ''} />
              {errors.routeTo && <div className="text-red-500 text-sm mt-1">{errors.routeTo}</div>}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>วันบิน *</Label>
              <Input type="date" value={form.flightDate} onChange={e => setForm(f => ({ ...f, flightDate: e.target.value }))} className={errors.flightDate ? 'border-red-400' : ''} />
              {errors.flightDate && <div className="text-red-500 text-sm mt-1">{errors.flightDate}</div>}
            </div>
            <div className="flex-1">
              <Label>ปิดรับของ *</Label>
              <Input type="date" value={form.closeDate} onChange={e => setForm(f => ({ ...f, closeDate: e.target.value }))} className={errors.closeDate ? 'border-red-400' : ''} />
              {errors.closeDate && <div className="text-red-500 text-sm mt-1">{errors.closeDate}</div>}
            </div>
            <div className="flex-1">
              <Label>วันส่งของ *</Label>
              <Input type="date" value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))} className={errors.deliveryDate ? 'border-red-400' : ''} />
              {errors.deliveryDate && <div className="text-red-500 text-sm mt-1">{errors.deliveryDate}</div>}
            </div>
          </div>
          <div>
            <Label>เรตราคา (น้ำหนัก/ราคา) *</Label>
            {form.rates.map((rate, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <Input placeholder="น้ำหนัก (เช่น 0.5kg)" value={rate.weight} onChange={e => handleRateChange(idx, 'weight', e.target.value)} className="w-32" />
                <Input placeholder="ราคา (เช่น $15)" value={rate.price} onChange={e => handleRateChange(idx, 'price', e.target.value)} className="w-32" />
                {form.rates.length > 1 && (
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeRate(idx)}><X className="h-4 w-4" /></Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="mt-1" onClick={addRate}>+ เพิ่มเรท</Button>
            {errors.rates && <div className="text-red-500 text-sm mt-1">{errors.rates}</div>}
          </div>
          <div>
            <Label>จุดนัดรับ *</Label>
            <Input placeholder="เช่น CBD, Melbourne Central" value={form.pickupPlace} onChange={e => setForm(f => ({ ...f, pickupPlace: e.target.value }))} className={errors.pickupPlace ? 'border-red-400' : ''} />
            {errors.pickupPlace && <div className="text-red-500 text-sm mt-1">{errors.pickupPlace}</div>}
          </div>
          <div>
            <Label>ประเภทของที่รับหิ้ว</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {itemTypeOptions.map(type => (
                <Badge key={type} className={form.itemTypes.includes(type) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'} onClick={() => toggleItemType(type)} style={{ cursor: 'pointer' }}>{type}</Badge>
              ))}
            </div>
          </div>
          <div>
            <Label>ข้อจำกัด</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {restrictionOptions.map(r => (
                <Badge key={r} className={form.restrictions.includes(r) ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'} onClick={() => toggleRestriction(r)} style={{ cursor: 'pointer' }}>{r}</Badge>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="description">หมายเหตุเพิ่มเติม</Label>
            <Textarea id="description" placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="contact">ช่องทางติดต่อ *</Label>
            <Input id="contact" placeholder="Line, FB, เบอร์โทร ฯลฯ" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} className={errors.contact ? 'border-red-400' : ''} />
            {errors.contact && <div className="text-red-500 text-sm mt-1">{errors.contact}</div>}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="urgent" checked={form.urgent} onChange={e => setForm(f => ({ ...f, urgent: e.target.checked }))} className="accent-red-500 h-4 w-4" />
            <Label htmlFor="urgent" className="text-red-500">ต้องการด่วน</Label>
          </div>
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
          <div className="flex gap-2 mt-6">
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin h-5 w-5" />} {mode === 'edit' ? 'บันทึก' : 'สร้าง'}
            </Button>
            {mode === 'edit' && onDelete && (
              <Button type="button" variant="destructive" onClick={() => setShowDelete(true)}>ลบ</Button>
            )}
          </div>
        </form>
        {/* Modal ยืนยันลบ */}
        {showDelete && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xs w-full text-center">
              <X className="h-10 w-10 text-red-300 mx-auto mb-2 animate-bounce" />
              <div className="text-lg font-semibold mb-2">ยืนยันการลบรายการนี้?</div>
              <div className="text-gray-400 mb-4 text-sm">การลบนี้ไม่สามารถย้อนกลับได้</div>
              <div className="flex gap-2 justify-center mt-4">
                <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="px-6">
                  {deleting && <span className="animate-spin mr-2">⏳</span>} ยืนยัน
                </Button>
                <Button variant="outline" onClick={() => setShowDelete(false)} disabled={deleting} className="px-6">ยกเลิก</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 