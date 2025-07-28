import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Loader2, Image as ImageIcon, X, Plane } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import countryList from '@/data/country-list-th.json';
import provinceList from '@/data/api_province.json';
import auCities from '@/data/AU.json';
import jpCities from '@/data/JP.json';
import usCities from '@/data/US.json';
import gbCities from '@/data/GB.json';
import krCities from '@/data/KR.json';
import frCities from '@/data/FR.json';
import deCities from '@/data/DE.json';
import sgCities from '@/data/SG.json';
import cnCities from '@/data/CN.json';

export interface OfferFormProps {
  initialData?: {
    routeFrom: string;
    routeTo: string;
    flightDate: string;
    closeDate: string;
    deliveryDate: string;
    rate: string;
    pickupPlace: string;
    description: string;
    contact: string;
    urgent: boolean;
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
    rate: "",
    pickupPlace: "",
    description: "",
    contact: "",
    urgent: false,
  });
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // เพิ่ม state สำหรับ dropdown
  const [countryFrom, setCountryFrom] = useState("");
  const [cityFrom, setCityFrom] = useState("");
  const [countryTo, setCountryTo] = useState("");
  const [cityTo, setCityTo] = useState("");
  const [cityListFrom, setCityListFrom] = useState<any[]>([]);
  const [cityListTo, setCityListTo] = useState<any[]>([]);

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

  useEffect(() => {
    if (!countryFrom) return setCityListFrom([]);
    getCityListByCountry(countryFrom).then(setCityListFrom);
  }, [countryFrom]);

  useEffect(() => {
    if (!countryTo) return setCityListTo([]);
    getCityListByCountry(countryTo).then(setCityListTo);
  }, [countryTo]);

  function validate() {
    const errs: any = {};
    if (!countryFrom) errs.countryFrom = "กรุณาเลือกประเทศต้นทาง";
    if (!cityFrom) errs.cityFrom = "กรุณาเลือกเมือง/จังหวัดต้นทาง";
    if (!countryTo) errs.countryTo = "กรุณาเลือกประเทศปลายทาง";
    if (!cityTo) errs.cityTo = "กรุณาเลือกเมือง/จังหวัดปลายทาง";
    if (!form.flightDate) errs.flightDate = "กรุณาเลือกวันบิน";
    if (!form.closeDate) errs.closeDate = "กรุณาเลือกวันปิดรับฝาก";
    if (!form.deliveryDate) errs.deliveryDate = "กรุณาเลือกวันส่งของ";
    if (form.closeDate && form.flightDate && form.closeDate > form.flightDate) errs.closeDate = "วันปิดรับฝากต้องไม่เกินวันบิน";
    if (form.deliveryDate && form.flightDate && form.deliveryDate < form.flightDate) errs.deliveryDate = "วันส่งของต้องหลังวันบิน";
    if (!form.rate) errs.rate = "กรุณากรอกเรตราคา";
    if (!form.pickupPlace) errs.pickupPlace = "กรุณากรอกจุดนัดรับ";
    if (!form.contact) errs.contact = "กรุณากรอกช่องทางติดต่อ";
    return errs;
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
      onSubmit({
        ...form,
        routeFrom: `${cityFrom}, ${countryFrom}`,
        routeTo: `${cityTo}, ${countryTo}`,
      });
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
    <Card className="max-w-lg w-full mx-auto p-8 rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md mt-8">
      <CardContent className="p-0 space-y-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
          <Plane className="h-6 w-6 text-indigo-500" /> {mode === 'edit' ? 'แก้ไขรอบเดินทาง' : 'โพสต์รอบเดินทางรับหิ้ว'}
        </h2>
        {success && (
          <div className="mb-6">
            <Badge className="bg-green-100 text-green-700 px-4 py-2 text-base">บันทึกสำเร็จ!</Badge>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section: ข้อมูลเส้นทาง */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>ประเทศต้นทาง *</Label>
              <Select value={countryFrom} onValueChange={val => { setCountryFrom(val); setCityFrom(""); }}>
                <SelectTrigger className="w-full rounded-xl shadow-sm">
                  <SelectValue placeholder="เลือกประเทศต้นทาง" />
                </SelectTrigger>
                <SelectContent>
                  {countryList.map((c: any) => (
                    <SelectItem key={c.alpha2} value={c.alpha2}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label className="mt-2 block">เมือง/จังหวัดต้นทาง *</Label>
              <Select value={cityFrom} onValueChange={setCityFrom} disabled={!countryFrom}>
                <SelectTrigger className="w-full rounded-xl shadow-sm">
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
            <div>
              <Label>ประเทศปลายทาง *</Label>
              <Select value={countryTo} onValueChange={val => { setCountryTo(val); setCityTo(""); }}>
                <SelectTrigger className="w-full rounded-xl shadow-sm">
                  <SelectValue placeholder="เลือกประเทศปลายทาง" />
                </SelectTrigger>
                <SelectContent>
                  {countryList.map((c: any) => (
                    <SelectItem key={c.alpha2} value={c.alpha2}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label className="mt-2 block">เมือง/จังหวัดปลายทาง *</Label>
              <Select value={cityTo} onValueChange={setCityTo} disabled={!countryTo}>
                <SelectTrigger className="w-full rounded-xl shadow-sm">
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
          {/* วันเดินทาง */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
              <Label>วันบิน *</Label>
              <Input type="date" value={form.flightDate} onChange={e => setForm(f => ({ ...f, flightDate: e.target.value }))} className={errors.flightDate ? 'border-red-400' : '' + ' w-full rounded-xl shadow-sm'} />
            {errors.flightDate && <div className="text-red-500 text-xs mt-1">{errors.flightDate}</div>}
          </div>
          <div>
              <Label>วันปิดรับฝาก *</Label>
              <Input type="date" value={form.closeDate} onChange={e => setForm(f => ({ ...f, closeDate: e.target.value }))} className={errors.closeDate ? 'border-red-400' : '' + ' w-full rounded-xl shadow-sm'} />
            {errors.closeDate && <div className="text-red-500 text-xs mt-1">{errors.closeDate}</div>}
            </div>
            <div>
              <Label>วันส่งของ *</Label>
              <Input type="date" value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))} className={errors.deliveryDate ? 'border-red-400' : '' + ' w-full rounded-xl shadow-sm'} />
              {errors.deliveryDate && <div className="text-red-500 text-xs mt-1">{errors.deliveryDate}</div>}
            </div>
          </div>
          {/* เรตราคา */}
          <div>
            <Label>เรตราคา (บาท/กก.) *</Label>
            <Input placeholder="เช่น 500" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} className={errors.rate ? 'border-red-400' : '' + ' w-full rounded-xl shadow-sm'} />
            {errors.rate && <div className="text-red-500 text-xs mt-1">{errors.rate}</div>}
          </div>
          {/* จุดนัดรับ */}
          <div>
            <Label>จุดนัดรับ *</Label>
            <Input placeholder="เช่น Siam, Central World" value={form.pickupPlace} onChange={e => setForm(f => ({ ...f, pickupPlace: e.target.value }))} className={errors.pickupPlace ? 'border-red-400' : '' + ' w-full rounded-xl shadow-sm'} />
            {errors.pickupPlace && <div className="text-red-500 text-xs mt-1">{errors.pickupPlace}</div>}
          </div>
          {/* รายละเอียดเพิ่มเติม */}
          <div>
            <Label>รายละเอียดเพิ่มเติม</Label>
            <Textarea placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full rounded-xl shadow-sm" />
          </div>
          {/* ช่องทางติดต่อ */}
          <div>
            <Label>ช่องทางติดต่อ *</Label>
            <Input placeholder="Line หรือเบอร์โทร" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} className={errors.contact ? 'border-red-400' : '' + ' w-full rounded-xl shadow-sm'} />
            {errors.contact && <div className="text-red-500 text-xs mt-1">{errors.contact}</div>}
          </div>
          {/* ด่วน */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="urgent" checked={form.urgent} onChange={e => setForm(f => ({ ...f, urgent: e.target.checked }))} />
            <Label htmlFor="urgent">ด่วน</Label>
          </div>
          {/* ปุ่ม action */}
          <div className="flex gap-4 mt-6">
            <Button type="submit" className="w-1/2 bg-gradient-to-r from-blue-400 via-indigo-400 to-pink-400 text-white font-bold py-2 rounded-xl shadow hover:scale-105 transition" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
            {mode === 'edit' ? 'บันทึกการแก้ไข' : 'โพสต์รอบเดินทาง'}
          </Button>
            <Button type="button" variant="outline" className="w-1/2 rounded-xl" onClick={() => setForm(initialData || {
              routeFrom: "",
              routeTo: "",
              flightDate: "",
              closeDate: "",
              deliveryDate: "",
              rate: "",
              pickupPlace: "",
              description: "",
              contact: "",
              urgent: false,
            })}>ล้างข้อมูล</Button>
          </div>
          {errors.submit && <div className="text-red-500 text-sm mt-2 text-center">{errors.submit}</div>}
        </form>
      </CardContent>
    </Card>
  );
} 