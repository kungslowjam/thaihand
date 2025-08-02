"use client";
import { useState, useRef, useEffect } from "react";
import { ShoppingBag, MapPin, Clock, DollarSign, Loader2, Image as ImageIcon, X, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SimpleNavigation } from "@/components/simple-navigation";
import { useSession, signOut } from "next-auth/react";
import { RequestForm } from "@/components/RequestForm";
import { OfferForm } from "@/components/OfferForm";
import { useBackendToken } from "@/lib/useBackendToken";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function CreateRequestPage() {
  const { data: session } = useSession();
  const [mode, setMode] = useState<'request' | 'offer'>('request');
  const { backendToken, loading, error } = useBackendToken();
  const router = useRouter();

  async function handleRequestSubmit(data: any) {
    if (!backendToken) {
      toast.error('กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    try {
      const payload = {
        title: data.title,
        from_location: data.fromLocation,
        to_location: data.toLocation,
        deadline: data.deadline,
        budget: parseInt(data.budget),
        description: data.description,
        image: data.image || null,
        urgent: data.urgent ? "true" : "false",
        offer_id: data.offer_id || null,
        source: "marketplace",
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${backendToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'เกิดข้อผิดพลาดในการสร้างคำขอ');
      }

      const result = await response.json();
      toast.success("สร้างคำขอฝากหิ้วสำเร็จ!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error('Error creating request:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการสร้างคำขอ');
    }
  }

  function handleOfferSubmit(data: any) {
    const payload = {
      route_from: data.routeFrom,
      route_to: data.routeTo,
      flight_date: data.flightDate,
      close_date: data.closeDate,
      delivery_date: data.deliveryDate,
      rates: JSON.stringify(data.rates ?? []),
      pickup_place: data.pickupPlace,
      item_types: JSON.stringify(data.itemTypes ?? []),
      restrictions: JSON.stringify(data.restrictions ?? []),
      description: data.description,
      contact: data.contact,
      urgent: data.urgent ? "true" : "false",
      image: data.image ?? null,
      // user_id: (session as any)?.user?.id, // ลบออก ไม่ต้องส่ง
    };
    fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/offers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(backendToken ? { "Authorization": `Bearer ${backendToken}` } : {})
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) return res.json().then(d => { throw new Error(JSON.stringify(d)); });
        return res.json();
      })
      .then(result => {
        toast.success("โพสต์รอบเดินทางรับหิ้วสำเร็จ!");
        router.push("/dashboard");
      })
      .catch(err => {
        toast.error("เกิดข้อผิดพลาด: " + err.message);
      });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="container mx-auto px-4 py-10 flex flex-col items-center">
        <div className="flex justify-center gap-2 mb-8">
          <Button type="button" variant={mode === 'request' ? 'default' : 'outline'} className="rounded-full px-6" onClick={() => setMode('request')}>ฝากหิ้ว</Button>
          <Button type="button" variant={mode === 'offer' ? 'default' : 'outline'} className="rounded-full px-6" onClick={() => setMode('offer')}>รับหิ้ว</Button>
        </div>
        {mode === 'request' ? (
          <RequestForm mode="create" onSubmit={handleRequestSubmit} />
        ) : (
          <OfferForm mode="create" onSubmit={handleOfferSubmit} />
        )}
      </div>
    </div>
  );
}
