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
import { RequestForm } from "@/components/RequestForm";
import { OfferForm } from "@/components/OfferForm";

export default function CreateRequestPage() {
  const { data: session } = useSession();
  const [mode, setMode] = useState<'request' | 'offer'>('request');

  function handleRequestSubmit(data: any) {
    // TODO: ส่งข้อมูลไป backend หรือแสดง success
    // ตัวอย่าง: console.log('request', data)
  }
  function handleOfferSubmit(data: any) {
    // TODO: ส่งข้อมูลไป backend หรือแสดง success
    // ตัวอย่าง: console.log('offer', data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <SimpleNavigation user={session?.user ? { name: session.user.name ?? "", avatar: session.user.image ?? undefined } : undefined} onLogout={() => signOut()} />
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
