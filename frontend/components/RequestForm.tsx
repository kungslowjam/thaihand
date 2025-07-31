import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, MapPin, Clock, DollarSign, Loader2, Image as ImageIcon, X } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import countryList from '@/data/country-list-th.json';
import provinceList from '@/data/api_province.json';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { createClient } from '@supabase/supabase-js';
import { useBackendToken } from "@/lib/useBackendToken";

// Safe Supabase client creation with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// เพิ่ม type guard สำหรับ session ที่มี accessToken
function getAccessToken(session: Session | null): string | undefined {
  return (session && typeof session === 'object' && 'accessToken' in session) ? (session as any).accessToken : undefined;
}
// ฟังก์ชัน dynamic import เมือง
async function getCityListByCountry(alpha2: string) {
  if (alpha2 === "TH") {
    return provinceList.map((p) => ({ code: p.code, name: p.name_th }));
  }
  try {
    const cityData = await import(`@/data/${alpha2}.json`);
    return cityData.default.cities || [];
  } catch {
    return [];
  }
}

async function uploadImageToSupabase(file: File) {
  try {
    console.log('uploading file to supabase:', file);
    console.log('supabaseUrl:', supabaseUrl);
    console.log('supabaseKey length:', supabaseKey?.length);
    
    // Check if Supabase is properly configured
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      console.warn('Supabase not configured, skipping image upload');
      return null;
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    console.log('fileName:', fileName);
    
    console.log('Starting Supabase upload...');
    const { data, error } = await supabase.storage
      .from('request-images')
      .upload(fileName, file);
    console.log('upload result', { data, error });
    
    if (error) {
      console.error('Supabase upload error:', error.message, error);
      throw error;
    }
    
    console.log('Getting public URL...');
    const { data: publicUrlData } = supabase
      .storage
      .from('request-images')
      .getPublicUrl(fileName);
    console.log('publicUrlData:', publicUrlData);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image to Supabase:', error);
    // Return null instead of throwing to prevent build failure
    return null;
  }
}

export interface RequestFormProps {
  initialData?: {
    title: string;
    fromLocation: string;
    toLocation: string;
    deadline: string;
    budget: string;
    description: string;
    urgent: boolean;
    imageFile: File | null;
    offer_id?: number; // เพิ่ม field นี้
  };
  mode?: 'create' | 'edit';
  onSubmit: (data: any) => void;
  onDelete?: () => void;
  offer_id?: number; // เพิ่ม field นี้ใน props
}

export function RequestForm({ initialData, mode = 'create', onSubmit, onDelete, offer_id }: RequestFormProps) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    fromLocation: initialData?.fromLocation || "",
    toLocation: initialData?.toLocation || "",
    deadline: initialData?.deadline || "",
    budget: initialData?.budget || "",
    description: initialData?.description || "",
    urgent: initialData?.urgent || false,
    imageFile: initialData?.imageFile || null,
    offer_id: initialData?.offer_id || offer_id || undefined // set จาก initialData หรือ prop
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // เพิ่ม state สำหรับ dropdown
  const [countryFrom, setCountryFrom] = useState("");
  const [cityFrom, setCityFrom] = useState("");
  const [countryTo, setCountryTo] = useState("");
  const [cityTo, setCityTo] = useState("");
  const [cityListFrom, setCityListFrom] = useState<any[]>([]);
  const [cityListTo, setCityListTo] = useState<any[]>([]);

  const { data: session } = useSession();
  const { backendToken, loading, error } = useBackendToken();
  const router = useRouter();

  // โหลดรายชื่อประเทศเมื่อ mount
  useEffect(() => {
    // ใน Select ของประเทศ ใช้ countryList
    // ใน Select ของเมือง/จังหวัด ใช้ cityListFrom/cityListTo ตามเดิม
  }, []);

  // โหลดเมือง/จังหวัดเมื่อเลือกประเทศ (ตัวอย่าง: ไทย = จังหวัด, อื่นๆ = เมืองหลัก)
  useEffect(() => {
    if (!countryFrom) return setCityListFrom([]);
    getCityListByCountry(countryFrom).then(setCityListFrom);
  }, [countryFrom]);

  useEffect(() => {
    if (!countryTo) return setCityListTo([]);
    getCityListByCountry(countryTo).then(setCityListTo);
  }, [countryTo]);

  useEffect(() => {
    setForm(f => ({
      ...f,
      fromLocation: countryFrom && cityFrom ? `${cityFrom}, ${countryFrom}` : "",
    }));
  }, [countryFrom, cityFrom]);

  useEffect(() => {
    setForm(f => ({
      ...f,
      toLocation: countryTo && cityTo ? `${cityTo}, ${countryTo}` : "",
    }));
  }, [countryTo, cityTo]);

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
    console.log("SUBMIT!", {form, countryFrom, cityFrom, countryTo, cityTo, session});
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      console.log("validate error", errs);
      return;
    }
    if (!backendToken) {
      console.log("ยังไม่มี backendToken");
      setErrors({ submit: "ยังไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณารอสักครู่" });
      return;
    }
    setSubmitting(true);
    setErrors({});

    let imageUrl = null;
    if (form.imageFile) {
      console.log('form.imageFile', form.imageFile);
      try {
        imageUrl = await uploadImageToSupabase(form.imageFile);
      } catch (err) {
        setErrors({ imageFile: "อัปโหลดรูปไม่สำเร็จ" });
        setSubmitting(false);
        return;
      }
    }

    const userId = session?.user?.id || session?.user?.email || "";
    if (mode === 'create') {
      try {
        console.log("กำลังจะ fetch /api/requests", backendToken, form);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/requests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${backendToken}`
          },
          body: JSON.stringify({
            title: form.title,
            from_location: `${cityFrom}, ${countryFrom}`,
            to_location: `${cityTo}, ${countryTo}`,
            deadline: form.deadline,
            budget: Number(form.budget) || 0,
            description: form.description || "",
            image: imageUrl, // ส่งเฉพาะ URL
            offer_id: form.offer_id, // เพิ่มบรรทัดนี้ ถ้ามี offer_id ใน form
            source: "create-request"
          })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error("API error", data);
          setErrors({ submit: data.detail || "บันทึกไม่สำเร็จ" });
          setSubmitting(false);
          return;
        }
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } catch (err) {
        setErrors({ submit: "เกิดข้อผิดพลาด: " + (err as any)?.message });
        setSubmitting(false);
      }
      return;
    }
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
          <ShoppingBag className="h-6 w-6 text-blue-500" /> {mode === 'edit' ? 'แก้ไขคำขอฝากหิ้ว' : 'สร้างคำขอฝากหิ้ว'}
        </h2>
        {success && (
          <div className="mb-6">
            <Badge className="bg-green-100 text-green-700 px-4 py-2 text-base">บันทึกสำเร็จ!</Badge>
          </div>
        )}
        {loading && (
          <div className="mb-6">
            <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-base flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังเชื่อมต่อกับเซิร์ฟเวอร์...
            </Badge>
          </div>
        )}
        {error && (
          <div className="mb-6">
            <Badge className="bg-red-100 text-red-700 px-4 py-2 text-base">
              ข้อผิดพลาดในการเชื่อมต่อ: {error}
            </Badge>
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
              <Select value={countryFrom} onValueChange={val => { setCountryFrom(val); setCityFrom(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเทศต้นทาง" />
                </SelectTrigger>
                <SelectContent>
                  {countryList.map((c: any) => (
                    <SelectItem key={c.alpha2} value={c.alpha2}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label htmlFor="cityFrom" className="mt-2 block">เมือง/จังหวัดต้นทาง *</Label>
              <Select value={cityFrom} onValueChange={setCityFrom} disabled={!countryFrom}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกเมือง/จังหวัดต้นทาง" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(cityListFrom) && cityListFrom.length > 0 ? (
                    cityListFrom.map((city: any, idx: number) => (
                      <SelectItem key={city.code || city.name || idx} value={city.name}>{city.name}</SelectItem>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-400">ไม่พบข้อมูลเมือง</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="toLocation">ประเทศปลายทาง *</Label>
              <Select value={countryTo} onValueChange={val => { setCountryTo(val); setCityTo(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเทศปลายทาง" />
                </SelectTrigger>
                <SelectContent>
                  {countryList.map((c: any) => (
                    <SelectItem key={c.alpha2} value={c.alpha2}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label htmlFor="cityTo" className="mt-2 block">เมือง/จังหวัดปลายทาง *</Label>
              <Select value={cityTo} onValueChange={setCityTo} disabled={!countryTo}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกเมือง/จังหวัดปลายทาง" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(cityListTo) && cityListTo.length > 0 ? (
                    cityListTo.map((city: any, idx: number) => (
                      <SelectItem key={city.code || city.name || idx} value={city.name}>{city.name}</SelectItem>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-400">ไม่พบข้อมูลเมือง</div>
                  )}
                </SelectContent>
              </Select>
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
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2" 
              disabled={submitting || !backendToken || loading}
            >
              {submitting && <Loader2 className="animate-spin h-5 w-5" />} 
              {mode === 'edit' ? 'บันทึก' : 'สร้าง'}
            </Button>
            {mode === 'edit' && onDelete && (
              <Button type="button" variant="destructive" onClick={() => setShowDelete(true)}>ลบ</Button>
            )}
          </div>
          {!backendToken && !loading && (
            <div className="text-orange-600 text-sm text-center mt-2">
              กำลังเชื่อมต่อกับเซิร์ฟเวอร์...
            </div>
          )}
          {errors.submit && (
            <div className="text-red-500 text-center mt-2">
              {Array.isArray(errors.submit)
                ? errors.submit.map((e: any, i: number) => (
                    <div key={i}>
                      {e.loc ? `[${e.loc.join('.')}] ` : ''}
                      {e.msg || JSON.stringify(e)}
                    </div>
                  ))
                : typeof errors.submit === "object"
                  ? JSON.stringify(errors.submit)
                  : errors.submit}
            </div>
          )}
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