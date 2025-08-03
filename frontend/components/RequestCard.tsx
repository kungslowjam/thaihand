import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/progress';
import { 
  Plane, 
  User, 
  Calendar, 
  BadgeDollarSign, 
  Star, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Package, 
  Phone, 
  Mail, 
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  CreditCard,
  Shield,
  Heart,
  Share2
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
  
  // ฟังก์ชันช่วยเหลือ
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'รออนุมัติ': return 'bg-yellow-100 text-yellow-700';
      case 'อนุมัติ': return 'bg-blue-100 text-blue-700';
      case 'ปฏิเสธ': return 'bg-red-100 text-red-700';
      case 'สำเร็จ': return 'bg-green-100 text-green-700';
      case 'ยกเลิก': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'รออนุมัติ': return <Clock className="h-4 w-4" />;
      case 'อนุมัติ': return <CheckCircle className="h-4 w-4" />;
      case 'ปฏิเสธ': return <XCircle className="h-4 w-4" />;
      case 'สำเร็จ': return <CheckCircle className="h-4 w-4" />;
      case 'ยกเลิก': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH').format(price);
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

  return (
    <Card className="overflow-hidden bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl border border-white/30 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      {/* Header with Image */}
      <div className="relative">
        <img 
          src={request.image || '/default-product.svg'} 
          alt={request.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = '/default-product.svg';
          }}
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
            {getStatusIcon(request.status)}
            {request.status}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          {request.urgent && (
            <Badge className="bg-pink-100 text-pink-600 rounded-full px-2 py-1 text-xs flex items-center gap-1">
              <Star className="w-3 h-3" />
              ด่วน
            </Badge>
          )}
          
          {showActions && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full w-8 h-8 p-0 bg-white/90 dark:bg-gray-900/90 shadow"
                onClick={() => onBookmark?.(request.id)}
                title={isBookmarked ? 'ลบจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
              >
                <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </Button>
              
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full w-8 h-8 p-0 bg-white/90 dark:bg-gray-900/90 shadow"
                onClick={() => onShare?.(request.id)}
                title="แชร์"
              >
                <Share2 className="w-4 h-4 text-blue-400" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-6">
        {/* Title and Type */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-400" />
              {request.title || 'สินค้าทั่วไป'}
            </h3>
            <Badge className="bg-gradient-to-r from-pink-200 to-purple-400 text-purple-800 px-2 py-0.5 text-xs rounded-full flex items-center gap-1 shadow-sm">
              <Package className="h-3 w-3" />
              ฝากหิ้ว
            </Badge>
          </div>
        </div>

        {/* Route Information */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4 text-blue-400" />
            <span className="font-medium">{shortenLocation(request.from_location)} → {shortenLocation(request.to_location)}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
              <Calendar className="h-3 w-3 text-blue-500" />
              บิน {formatDate(request.deadline)}
            </span>
            {request.close_date && (
              <span className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full">
                <Clock className="h-3 w-3 text-orange-500" />
                ปิดรับ {formatDate(request.close_date)}
              </span>
            )}
          </div>
        </div>

        {/* Price and Budget */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg">
            <BadgeDollarSign className="h-5 w-5 text-green-500" />
            <span className="text-green-700 dark:text-green-300 font-bold text-lg">
              {formatPrice(request.budget)} บาท
            </span>
          </div>
          {request.weight && (
            <Badge variant="outline" className="text-xs bg-white shadow-sm">
              <Package className="h-3 w-3 mr-1" />
              น้ำหนัก: {request.weight} กก.
            </Badge>
          )}
        </div>

        {/* User Information */}
        <div className="flex items-center gap-3 mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-blue-100 dark:border-gray-600">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
            {request.user_image ? (
              <img 
                src={request.user_image} 
                alt={request.user || 'User'} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6" />
            )}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              {request.user || 'ไม่ระบุชื่อ'}
              <Shield className="h-3 w-3 text-green-500" />
            </div>
            {request.rating && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{request.rating}</span>
                {request.review_count && (
                  <span className="text-gray-400">({request.review_count} รีวิว)</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {request.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {request.description}
            </p>
          </div>
        )}

        {/* Payment and Shipping Status */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs bg-blue-50 px-2 py-1 rounded-lg">
            <CreditCard className="h-3 w-3 text-blue-500" />
            <span className="text-gray-700 font-medium">
              {request.payment_status || 'รอชำระเงิน'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs bg-green-50 px-2 py-1 rounded-lg">
            <Truck className="h-3 w-3 text-green-500" />
            <span className="text-gray-700 font-medium">
              {request.shipping_status || 'รอจัดส่ง'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2">
            {mode === 'view' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-200"
                  onClick={() => onView?.(request.id)}
                >
                  <Eye className="h-4 w-4" />
                  ดูรายละเอียด
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => onContact?.(request.id)}
                >
                  <MessageCircle className="h-4 w-4" />
                  ฝากหิ้ว
                </Button>
              </>
            )}

            {mode === 'edit' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 flex items-center gap-2"
                  onClick={() => onEdit?.(request.id)}
                >
                  <Edit className="h-4 w-4" />
                  แก้ไข
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={() => onDelete?.(request.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  ลบ
                </Button>
              </>
            )}

            {mode === 'manage' && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1 flex items-center gap-2"
                  onClick={() => onApprove?.(request.id)}
                >
                  <CheckCircle className="h-4 w-4" />
                  อนุมัติ
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={() => onReject?.(request.id)}
                >
                  <XCircle className="h-4 w-4" />
                  ปฏิเสธ
                </Button>
              </>
            )}
          </div>
        )}

        {/* Footer Information */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              สร้างเมื่อ {formatDate(request.created_at || '')}
            </span>
            {request.updated_at && request.updated_at !== request.created_at && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                อัปเดต {formatDate(request.updated_at)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 