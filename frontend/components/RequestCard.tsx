import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plane, 
  MapPin, 
  Phone, 
  FileText,
  Star
} from 'lucide-react';

interface RequestCardProps {
  request: {
    id: number;
    title: string;
    from_location: string;
    to_location: string;
    deadline: string;
    close_date?: string;
    budget: number;
    description: string;
    image?: string;
    status: string;
    user?: string;
    user_email?: string;
    user_image?: string;
    carrier_name?: string;
    carrier_email?: string;
    carrier_phone?: string;
    carrier_image?: string;
    offer_id?: number;
    source?: string;
    created_at?: string;
    updated_at?: string;
    urgent?: boolean;
    weight?: number;
    amount?: number;
    note?: string;
    payment_status?: string;
    shipping_status?: string;
    rating?: number;
    review_count?: number;
    pickup_place?: string;
    contact?: string;
  };
  mode?: 'view' | 'edit' | 'manage';
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onContact?: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onBookmark?: (id: number) => void;
  onShare?: (id: number) => void;
  isBookmarked?: boolean;
  showActions?: boolean;
}

export default function RequestCard({
  request,
  mode = 'view',
  onView,
  onEdit,
  onDelete,
  onContact,
  onApprove,
  onReject,
  onBookmark,
  onShare,
  isBookmarked = false,
  showActions = true
}: RequestCardProps) {
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  };

  const shortenLocation = (location: string) => {
    if (!location) return '-';
    const parts = location.split(',');
    if (parts.length >= 2) {
      const city = parts[0].trim();
      const country = parts[parts.length - 1].trim();
      return `${city}, ${country}`;
    }
    return location;
  };

  const getCountryCode = (location: string) => {
    if (!location) return 'us';
    const parts = location.split(',');
    const country = parts[parts.length - 1]?.trim().toLowerCase();
    
    // Map country names to country codes
    const countryMap: { [key: string]: string } = {
      'thailand': 'th',
      'thai': 'th',
      'australia': 'au',
      'australian': 'au',
      'japan': 'jp',
      'japanese': 'jp',
      'singapore': 'sg',
      'singaporean': 'sg',
      'malaysia': 'my',
      'malaysian': 'my',
      'indonesia': 'id',
      'indonesian': 'id',
      'philippines': 'ph',
      'filipino': 'ph',
      'vietnam': 'vn',
      'vietnamese': 'vn',
      'cambodia': 'kh',
      'cambodian': 'kh',
      'laos': 'la',
      'laotian': 'la',
      'myanmar': 'mm',
      'burmese': 'mm',
      'brunei': 'bn',
      'bruneian': 'bn',
      'east timor': 'tl',
      'timorese': 'tl'
    };
    
    return countryMap[country] || 'us';
  };

  const fromCountryCode = getCountryCode(request.from_location);
  const toCountryCode = getCountryCode(request.to_location);

  return (
    <Card className="bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl border-0 p-6 flex flex-col w-full max-w-[320px] mx-auto transition-transform hover:scale-105 hover:shadow-[0_8px_32px_rgba(80,80,200,0.15)] duration-200">
      <div className="flex items-center gap-2 mb-4">
        {/* ธงชาติแบบ flex row ไม่ absolute */}
        <img 
          src={`https://flagcdn.com/48x36/${fromCountryCode}.png`} 
          alt="" 
          className="w-7 h-7 rounded-full border-2 border-white shadow" 
        />
        <img 
          src={`https://flagcdn.com/48x36/${toCountryCode}.png`} 
          alt="" 
          className="w-7 h-7 rounded-full border-2 border-white shadow -ml-2" 
        />
        <div className="ml-2 flex-1 truncate font-bold text-lg text-gray-900">
          {request.title || "สินค้าทั่วไป"} 
          <span className="text-sm text-gray-500 font-normal block">
            {shortenLocation(request.from_location)} → {shortenLocation(request.to_location)}
          </span>
        </div>
        {request.urgent && (
          <span className="ml-auto bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-full px-3 py-0.5 text-xs font-semibold shadow flex items-center gap-1">
            <Star className="w-3 h-3" />
            ด่วน
          </span>
        )}
      </div>
      
      <div className="flex items-center text-xs text-gray-500 mb-2 gap-2">
        <span>✈️ {formatDate(request.deadline)}</span>
        <span>•</span>
        <span>ปิดรับ {formatDate(request.close_date || request.deadline)}</span>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <span className="text-indigo-700 font-bold text-xl">
          {request.budget ? `${request.budget.toLocaleString()} บาท` : "-"}
        </span>
      </div>
      
      <div className="flex flex-col gap-1 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-blue-400">📍</span> 
          <span>จุดนัดรับ: {request.pickup_place || request.carrier_name || "-"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-400">📞</span> 
          <span>ติดต่อ: {request.contact || request.carrier_phone || request.user || "-"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400">📝</span> 
          <span>หมายเหตุ: {request.note || request.description || "-"}</span>
        </div>
      </div>
      
      <button
        className="mt-auto w-full bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold py-2.5 rounded-2xl shadow-lg text-base hover:scale-105 transition"
        onClick={() => onContact?.(request.id)}
      >
        รับหิ้ว
      </button>
    </Card>
  );
} 