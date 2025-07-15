"use client";
import { useState, useRef } from "react";
import { ShoppingBag, MapPin, Clock, DollarSign, Loader2, Image as ImageIcon, X, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SimpleNavigation } from "@/components/simple-navigation";
import { useSession, signOut } from "next-auth/react";

export default function CreateRequestPage() {
  const { data: session } = useSession();
  const [mode, setMode] = useState<'request' | 'offer'>('request');

  // ฝากหิ้ว (Request)
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
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // รับหิ้ว (Offer)
  const [offerForm, setOfferForm] = useState({
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
  const [offerImagePreview, setOfferImagePreview] = useState<string>("");
  const [offerErrors, setOfferErrors] = useState<any>({});
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);
  const offerFileInputRef = useRef<HTMLInputElement>(null);

  // ฝากหิ้ว validate
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
  // รับหิ้ว validate
  function validateOffer() {
    const errs: any = {};
    if (!offerForm.routeFrom) errs.routeFrom = "กรุณากรอกประเทศต้นทาง";
    if (!offerForm.routeTo) errs.routeTo = "กรุณากรอกประเทศปลายทาง";
    if (!offerForm.flightDate) errs.flightDate = "กรุณาเลือกวันบิน";
    if (!offerForm.closeDate) errs.closeDate = "กรุณาเลือกวันปิดรับของ";
    if (!offerForm.deliveryDate) errs.deliveryDate = "กรุณาเลือกวันส่งของ";
    if (!offerForm.rates.some(r => r.weight && r.price)) errs.rates = "กรุณากรอกเรตราคาอย่างน้อย 1 รายการ";
    if (!offerForm.pickupPlace) errs.pickupPlace = "กรุณากรอกจุดนัดรับ";
    if (offerForm.imageFile && !offerForm.imageFile.type.startsWith("image/")) {
      errs.imageFile = "กรุณาอัปโหลดไฟล์ภาพ (.jpg, .png, .webp)";
    }
    if (!offerForm.contact) errs.contact = "กรุณากรอกช่องทางติดต่อ";
    return errs;
  }

  // ฝากหิ้ว image
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

  // รับหิ้ว image
  function handleOfferImageFileChange(e: any) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev: any) => {
        setOfferImagePreview(ev.target.result);
        setOfferForm(f => ({ ...f, imageFile: file }));
      };
      reader.readAsDataURL(file);
    } else {
      setOfferImagePreview("");
      setOfferForm(f => ({ ...f, imageFile: null }));
    }
  }
  function handleRemoveOfferImage() {
    setOfferImagePreview("");
    setOfferForm(f => ({ ...f, imageFile: null }));
    if (offerFileInputRef.current) offerFileInputRef.current.value = "";
  }

  // ฝากหิ้ว submit
  async function handleSubmit(e: any) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setForm({ title: "", fromLocation: "", toLocation: "", deadline: "", budget: "", description: "", urgent: false, imageFile: null });
      setImagePreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 1200); // mock submit
  }
  // รับหิ้ว submit
  async function handleOfferSubmit(e: any) {
    e.preventDefault();
    const errs = validateOffer();
    setOfferErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setOfferSubmitting(true);
    setTimeout(() => {
      setOfferSubmitting(false);
      setOfferSuccess(true);
      setOfferForm({ routeFrom: "", routeTo: "", flightDate: "", closeDate: "", deliveryDate: "", rates: [{ weight: "", price: "" }], pickupPlace: "", itemTypes: [], description: "", restrictions: [], contact: "", urgent: false, imageFile: null });
      setOfferImagePreview("");
      if (offerFileInputRef.current) offerFileInputRef.current.value = "";
    }, 1200); // mock submit
  }

  // --- เพิ่มฟังก์ชันสำหรับเรตราคา ---
  function handleRateChange(idx: number, field: 'weight' | 'price', value: string) {
    setOfferForm(f => {
      const rates = [...f.rates];
      rates[idx][field] = value;
      return { ...f, rates };
    });
  }
  function addRate() {
    setOfferForm(f => ({ ...f, rates: [...f.rates, { weight: "", price: "" }] }));
  }
  function removeRate(idx: number) {
    setOfferForm(f => ({ ...f, rates: f.rates.filter((_, i) => i !== idx) }));
  }

  // --- เพิ่มฟังก์ชัน multi-select ---
  const itemTypeOptions = [
    "วิตามิน", "Pandora", "เครื่องประดับ", "Brandname", "รองเท้า", "ของใช้", "อื่นๆ"
  ];
  function toggleItemType(type: string) {
    setOfferForm(f => f.itemTypes.includes(type)
      ? { ...f, itemTypes: f.itemTypes.filter(t => t !== type) }
      : { ...f, itemTypes: [...f.itemTypes, type] });
  }
  const restrictionOptions = [
    "ไม่รับของผิดกฎหมาย", "ไม่รับของแตกหักง่าย", "ไม่รับของขนาดใหญ่", "ไม่รับของเสียภาษี/declare", "ขออนุญาตแกะของทุกชิ้น"
  ];
  function toggleRestriction(r: string) {
    setOfferForm(f => f.restrictions.includes(r)
      ? { ...f, restrictions: f.restrictions.filter(t => t !== r) }
      : { ...f, restrictions: [...f.restrictions, r] });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <SimpleNavigation user={session?.user ? { name: session.user.name ?? "", avatar: session.user.image ?? undefined } : undefined} onLogout={() => signOut()} />
      <div className="container mx-auto px-4 py-10 flex flex-col items-center">
        <Card className="max-w-lg w-full mx-auto p-8 rounded-3xl shadow-2xl bg-white/70 backdrop-blur-md mt-8">
          <CardContent className="p-0">
            {/* Toggle Process */}
            <div className="flex justify-center gap-2 mb-8">
              <Button type="button" variant={mode === 'request' ? 'default' : 'outline'} className="rounded-full px-6" onClick={() => setMode('request')}>
                ฝากหิ้ว
              </Button>
              <Button type="button" variant={mode === 'offer' ? 'default' : 'outline'} className="rounded-full px-6" onClick={() => setMode('offer')}>
                รับหิ้ว
              </Button>
            </div>
            {/* ฝากหิ้ว (Request) */}
            {mode === 'request' && (
              <>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                  <ShoppingBag className="h-6 w-6 text-blue-500" /> สร้างคำขอฝากหิ้ว
                </h2>
                {success && (
                  <div className="mb-6">
                    <Badge className="bg-green-100 text-green-700 px-4 py-2 text-base">ส่งคำขอสำเร็จ!</Badge>
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
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2" disabled={submitting}>
                    {submitting && <Loader2 className="animate-spin h-5 w-5" />} ส่งคำขอ
                  </Button>
                </form>
              </>
            )}
            {/* รับหิ้ว (Offer) */}
            {mode === 'offer' && (
              <>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                  <Plane className="h-6 w-6 text-indigo-500" /> สร้างข้อเสนอรับหิ้ว
                </h2>
                {offerSuccess && (
                  <div className="mb-6">
                    <Badge className="bg-green-100 text-green-700 px-4 py-2 text-base">ส่งข้อเสนอสำเร็จ!</Badge>
                  </div>
                )}
                <form onSubmit={handleOfferSubmit} className="space-y-5">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label>ต้นทาง *</Label>
                      <Input placeholder="เช่น MEL" value={offerForm.routeFrom} onChange={e => setOfferForm(f => ({ ...f, routeFrom: e.target.value }))} className={offerErrors.routeFrom ? 'border-red-400' : ''} />
                      {offerErrors.routeFrom && <div className="text-red-500 text-sm mt-1">{offerErrors.routeFrom}</div>}
                    </div>
                    <div className="flex items-center px-2">→</div>
                    <div className="flex-1">
                      <Label>ปลายทาง *</Label>
                      <Input placeholder="เช่น BKK" value={offerForm.routeTo} onChange={e => setOfferForm(f => ({ ...f, routeTo: e.target.value }))} className={offerErrors.routeTo ? 'border-red-400' : ''} />
                      {offerErrors.routeTo && <div className="text-red-500 text-sm mt-1">{offerErrors.routeTo}</div>}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label>วันบิน *</Label>
                      <Input type="date" value={offerForm.flightDate} onChange={e => setOfferForm(f => ({ ...f, flightDate: e.target.value }))} className={offerErrors.flightDate ? 'border-red-400' : ''} />
                      {offerErrors.flightDate && <div className="text-red-500 text-sm mt-1">{offerErrors.flightDate}</div>}
                    </div>
                    <div className="flex-1">
                      <Label>ปิดรับของ *</Label>
                      <Input type="date" value={offerForm.closeDate} onChange={e => setOfferForm(f => ({ ...f, closeDate: e.target.value }))} className={offerErrors.closeDate ? 'border-red-400' : ''} />
                      {offerErrors.closeDate && <div className="text-red-500 text-sm mt-1">{offerErrors.closeDate}</div>}
                    </div>
                    <div className="flex-1">
                      <Label>วันส่งของ *</Label>
                      <Input type="date" value={offerForm.deliveryDate} onChange={e => setOfferForm(f => ({ ...f, deliveryDate: e.target.value }))} className={offerErrors.deliveryDate ? 'border-red-400' : ''} />
                      {offerErrors.deliveryDate && <div className="text-red-500 text-sm mt-1">{offerErrors.deliveryDate}</div>}
                    </div>
                  </div>
                  <div>
                    <Label>เรตราคา (น้ำหนัก/ราคา) *</Label>
                    {offerForm.rates.map((rate, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <Input placeholder="น้ำหนัก (เช่น 0.5kg)" value={rate.weight} onChange={e => handleRateChange(idx, 'weight', e.target.value)} className="w-32" />
                        <Input placeholder="ราคา (เช่น $15)" value={rate.price} onChange={e => handleRateChange(idx, 'price', e.target.value)} className="w-32" />
                        {offerForm.rates.length > 1 && (
                          <Button type="button" size="icon" variant="ghost" onClick={() => removeRate(idx)}><X className="h-4 w-4" /></Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="mt-1" onClick={addRate}>+ เพิ่มเรท</Button>
                    {offerErrors.rates && <div className="text-red-500 text-sm mt-1">{offerErrors.rates}</div>}
                  </div>
                  <div>
                    <Label>จุดนัดรับ *</Label>
                    <Input placeholder="เช่น CBD, Melbourne Central" value={offerForm.pickupPlace} onChange={e => setOfferForm(f => ({ ...f, pickupPlace: e.target.value }))} className={offerErrors.pickupPlace ? 'border-red-400' : ''} />
                    {offerErrors.pickupPlace && <div className="text-red-500 text-sm mt-1">{offerErrors.pickupPlace}</div>}
                </div>
                  <div>
                    <Label>ประเภทของที่รับ</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {itemTypeOptions.map(type => (
                        <Button key={type} type="button" variant={offerForm.itemTypes.includes(type) ? 'default' : 'outline'} size="sm" className="rounded-full" onClick={() => toggleItemType(type)}>{type}</Button>
                      ))}
                </div>
              </div>
                  <div>
                    <Label>ข้อจำกัด/หมายเหตุ</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {restrictionOptions.map(r => (
                        <Button key={r} type="button" variant={offerForm.restrictions.includes(r) ? 'default' : 'outline'} size="sm" className="rounded-full" onClick={() => toggleRestriction(r)}>{r}</Button>
                      ))}
                    </div>
                    <Textarea className="mt-2" placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)" value={offerForm.description} onChange={e => setOfferForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div>
                    <Label>ช่องทางติดต่อ *</Label>
                    <Input placeholder="Line/IG/เบอร์โทร" value={offerForm.contact} onChange={e => setOfferForm(f => ({ ...f, contact: e.target.value }))} className={offerErrors.contact ? 'border-red-400' : ''} />
                    {offerErrors.contact && <div className="text-red-500 text-sm mt-1">{offerErrors.contact}</div>}
                  </div>
                  {/* รูปภาพ */}
                  <div>
                    <Label>อัปโหลดรูป/ตั๋ว</Label>
                    <div className="flex gap-2 items-center mt-1">
                      <Button type="button" variant="outline" className="flex items-center gap-1 px-3 py-2" onClick={() => offerFileInputRef.current?.click()}>
                        <ImageIcon className="h-4 w-4" /> อัปโหลด
                      </Button>
                      <input
                        ref={offerFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleOfferImageFileChange}
                />
              </div>
                    {offerErrors.imageFile && <div className="text-red-500 text-sm mt-1">{offerErrors.imageFile}</div>}
                    {offerImagePreview && (
                      <div className="relative mt-3 w-32 h-32 rounded-xl overflow-hidden border bg-gray-50 flex items-center justify-center">
                        <img src={offerImagePreview} alt="preview" className="object-contain w-full h-full" />
                        <Button type="button" size="icon" variant="ghost" className="absolute top-1 right-1 bg-white/80" onClick={handleRemoveOfferImage}>
                          <X className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    )}
              </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="urgent-offer" checked={offerForm.urgent} onChange={e => setOfferForm(f => ({ ...f, urgent: e.target.checked }))} className="accent-red-500 h-4 w-4" />
                    <Label htmlFor="urgent-offer" className="text-red-500">ต้องการด่วน</Label>
              </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center gap-2" disabled={offerSubmitting}>
                    {offerSubmitting && <Loader2 className="animate-spin h-5 w-5" />} ส่งข้อเสนอ
              </Button>
            </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
