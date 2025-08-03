import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  X, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  BadgeDollarSign, 
  Package, 
  Phone, 
  Mail, 
  MessageCircle, 
  Star, 
  Shield, 
  Truck, 
  CreditCard, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Heart,
  Share2,
  Edit,
  Trash2
} from "lucide-react";

interface RequestDetailModalProps {
  open: boolean;
  onClose: () => void;
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
  } | null;
  mode?: 'view' | 'edit' | 'manage';
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onContact?: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onBookmark?: (id: number) => void;
  onShare?: (id: number) => void;
  isBookmarked?: boolean;
}

export default function RequestDetailModal({ 
  open, 
  onClose, 
  request, 
  mode = 'view',
  onEdit,
  onDelete,
  onContact,
  onApprove,
  onReject,
  onBookmark,
  onShare,
  isBookmarked = false
}: RequestDetailModalProps) {
  
  if (!open || !request) return null;

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="relative">
          <img 
            src={request.image || '/default-product.svg'} 
            alt={request.title}
            className="w-full h-64 object-cover rounded-t-3xl"
            onError={(e) => {
              e.currentTarget.src = '/default-product.svg';
            }}
          />
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
              {getStatusIcon(request.status)}
              {request.status}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            {request.urgent && (
              <Badge className="bg-pink-100 text-pink-600 rounded-full px-3 py-1 text-sm flex items-center gap-1">
                <Star className="w-4 h-4" />
                ด่วน
              </Badge>
            )}
            
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full w-10 h-10 p-0 bg-white/90 dark:bg-gray-900/90 shadow"
              onClick={() => onBookmark?.(request.id)}
              title={isBookmarked ? 'ลบจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
            >
              <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full w-10 h-10 p-0 bg-white/90 dark:bg-gray-900/90 shadow"
              onClick={() => onShare?.(request.id)}
              title="แชร์"
            >
              <Share2 className="w-5 h-5 text-blue-400" />
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full w-10 h-10 p-0 bg-white/90 dark:bg-gray-900/90 shadow"
              onClick={onClose}
              title="ปิด"
            >
              <X className="w-5 h-5 text-gray-400" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title and Type */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Package className="h-6 w-6 text-indigo-400" />
              {request.title || 'สินค้าทั่วไป'}
            </h2>
            <Badge className="bg-gradient-to-r from-indigo-200 to-indigo-400 text-indigo-800 px-3 py-1 text-sm rounded-full flex items-center gap-1">
              <Star className="h-4 w-4" />
              {request.offer_id ? 'รับหิ้ว' : 'ฝากหิ้ว'}
            </Badge>
          </div>

          {/* Route Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-400" />
                เส้นทาง
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">จาก:</span>
                <span className="font-semibold">{shortenLocation(request.from_location)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ไป:</span>
                <span className="font-semibold">{shortenLocation(request.to_location)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">วันที่บิน:</span>
                <span className="font-semibold">{formatDate(request.deadline)}</span>
              </div>
              {request.close_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ปิดรับ:</span>
                  <span className="font-semibold">{formatDate(request.close_date)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price and Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BadgeDollarSign className="h-5 w-5 text-green-500" />
                ราคาและรายละเอียด
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">งบประมาณ:</span>
                <span className="text-green-700 dark:text-green-300 font-bold text-xl">
                  {formatPrice(request.budget)} บาท
                </span>
              </div>
              {request.weight && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">น้ำหนัก:</span>
                  <span className="font-semibold">{request.weight} กก.</span>
                </div>
              )}
              {request.amount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">จำนวน:</span>
                  <span className="font-semibold">{request.amount} ชิ้น</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-purple-400" />
                ข้อมูลผู้ใช้
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                  {request.user_image ? (
                    <img 
                      src={request.user_image} 
                      alt={request.user || 'User'} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                    {request.user || 'ไม่ระบุชื่อ'}
                  </div>
                  {request.user_email && (
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {request.user_email}
                    </div>
                  )}
                  {request.rating && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{request.rating}</span>
                      {request.review_count && (
                        <span>({request.review_count} รีวิว)</span>
                      )}
                    </div>
                  )}
                </div>
                <Shield className="h-6 w-6 text-green-500" title="ยืนยันตัวตนแล้ว" />
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {request.description && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">รายละเอียด</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {request.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Payment and Shipping Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">สถานะการดำเนินการ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-400" />
                  การชำระเงิน:
                </span>
                <span className="font-semibold">
                  {request.payment_status || 'รอชำระเงิน'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-green-400" />
                  การจัดส่ง:
                </span>
                <span className="font-semibold">
                  {request.shipping_status || 'รอจัดส่ง'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">ข้อมูลเวลา</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">สร้างเมื่อ:</span>
                <span className="text-sm">{formatDate(request.created_at || '')}</span>
              </div>
              {request.updated_at && request.updated_at !== request.created_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">อัปเดตล่าสุด:</span>
                  <span className="text-sm">{formatDate(request.updated_at)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {mode === 'view' && (
              <>
                <Button
                  variant="outline"
                  className="flex-1 flex items-center gap-2"
                  onClick={() => onContact?.(request.id)}
                >
                  <MessageCircle className="h-4 w-4" />
                  ติดต่อ
                </Button>
                <Button
                  variant="default"
                  className="flex items-center gap-2"
                  onClick={() => onEdit?.(request.id)}
                >
                  <Edit className="h-4 w-4" />
                  แก้ไข
                </Button>
              </>
            )}

            {mode === 'edit' && (
              <>
                <Button
                  variant="outline"
                  className="flex-1 flex items-center gap-2"
                  onClick={() => onEdit?.(request.id)}
                >
                  <Edit className="h-4 w-4" />
                  แก้ไข
                </Button>
                <Button
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
                  variant="default"
                  className="flex-1 flex items-center gap-2"
                  onClick={() => onApprove?.(request.id)}
                >
                  <CheckCircle className="h-4 w-4" />
                  อนุมัติ
                </Button>
                <Button
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
        </div>
      </div>
    </div>
  );
} 