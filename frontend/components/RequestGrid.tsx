import React, { useState, useEffect } from 'react';
import RequestCard from './RequestCard';
import RequestDetailModal from './RequestDetailModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  SortAsc, 
  Grid, 
  List,
  Heart,
  Share2,
  MessageCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

interface Request {
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
}

interface RequestGridProps {
  requests: Request[];
  mode?: 'view' | 'edit' | 'manage';
  loading?: boolean;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onContact?: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onBookmark?: (id: number) => void;
  onShare?: (id: number) => void;
  bookmarkedIds?: number[];
  showFilters?: boolean;
  showSearch?: boolean;
  showSort?: boolean;
  showViewToggle?: boolean;
}

export default function RequestGrid({
  requests,
  mode = 'view',
  loading = false,
  onView,
  onEdit,
  onDelete,
  onContact,
  onApprove,
  onReject,
  onBookmark,
  onShare,
  bookmarkedIds = [],
  showFilters = true,
  showSearch = true,
  showSort = true,
  showViewToggle = true
}: RequestGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter requests based on search and filters
  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.from_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.to_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      case 'oldest':
        return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
      case 'price-high':
        return (b.budget || 0) - (a.budget || 0);
      case 'price-low':
        return (a.budget || 0) - (b.budget || 0);
      case 'deadline':
        return new Date(a.deadline || '').getTime() - new Date(b.deadline || '').getTime();
      case 'urgent':
        return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
      default:
        return 0;
    }
  });

  const handleViewRequest = (request: Request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedRequest(null);
  };

  const handleBookmark = (id: number) => {
    onBookmark?.(id);
  };

  const handleShare = (id: number) => {
    onShare?.(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      {(showSearch || showFilters || showSort || showViewToggle) && (
        <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl p-4 shadow-sm border border-white/30 dark:border-gray-800">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            {showSearch && (
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="ค้นหาคำขอ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* Status Filter */}
            {showFilters && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">ทุกสถานะ</option>
                  <option value="รออนุมัติ">รออนุมัติ</option>
                  <option value="อนุมัติ">อนุมัติ</option>
                  <option value="ปฏิเสธ">ปฏิเสธ</option>
                  <option value="สำเร็จ">สำเร็จ</option>
                  <option value="ยกเลิก">ยกเลิก</option>
                </select>
              </div>
            )}

            {/* Sort */}
            {showSort && (
              <div className="flex items-center gap-2">
                <SortAsc className="h-4 w-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">ใหม่สุด</option>
                  <option value="oldest">เก่าสุด</option>
                  <option value="price-high">ราคาสูง-ต่ำ</option>
                  <option value="price-low">ราคาต่ำ-สูง</option>
                  <option value="deadline">ใกล้วันเดินทาง</option>
                  <option value="urgent">ด่วน</option>
                </select>
              </div>
            )}

            {/* View Toggle */}
            {showViewToggle && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  onClick={() => setViewMode('grid')}
                  className="p-2"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  onClick={() => setViewMode('list')}
                  className="p-2"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Results Count */}
            <div className="text-sm text-gray-500">
              แสดง {sortedRequests.length} รายการ
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {sortedRequests.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            ไม่พบคำขอที่ตรงกับเงื่อนไข
          </h3>
          <p className="text-gray-500">
            ลองเปลี่ยนคำค้นหาหรือเงื่อนไขการกรอง
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {sortedRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              mode={mode}
              onView={() => handleViewRequest(request)}
              onEdit={onEdit}
              onDelete={onDelete}
              onContact={onContact}
              onApprove={onApprove}
              onReject={onReject}
              onBookmark={handleBookmark}
              onShare={handleShare}
              isBookmarked={bookmarkedIds.includes(request.id)}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          open={showDetailModal}
          onClose={handleCloseModal}
          request={selectedRequest}
          mode={mode}
          onEdit={onEdit}
          onDelete={onDelete}
          onContact={onContact}
          onApprove={onApprove}
          onReject={onReject}
          onBookmark={handleBookmark}
          onShare={handleShare}
          isBookmarked={bookmarkedIds.includes(selectedRequest.id)}
        />
      )}
    </div>
  );
} 