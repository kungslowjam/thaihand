import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';

interface RequestStatsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
    cancelled: number;
    totalBudget: number;
    averageBudget: number;
    urgentCount: number;
    activeUsers: number;
    thisMonth: number;
    lastMonth: number;
  };
  loading?: boolean;
}

export default function RequestStats({ stats, loading = false }: RequestStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คำขอทั้งหมด</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.total)}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.thisMonth} จากเดือนนี้
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">งบประมาณรวม</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              เฉลี่ย {formatCurrency(stats.averageBudget)} ต่อรายการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผู้ใช้ที่ใช้งาน</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.activeUsers)}</div>
            <p className="text-xs text-muted-foreground">
              ผู้ใช้ที่ใช้งานในเดือนนี้
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คำขอด่วน</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.urgentCount)}</div>
            <p className="text-xs text-muted-foreground">
              {calculatePercentage(stats.urgentCount, stats.total)}% ของทั้งหมด
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">สถานะคำขอ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Badge className={`${getStatusColor('pending')} flex items-center gap-1`}>
                  {getStatusIcon('pending')}
                  รออนุมัติ
                </Badge>
              </div>
              <div className="text-2xl font-bold">{formatNumber(stats.pending)}</div>
              <div className="text-xs text-muted-foreground">
                {calculatePercentage(stats.pending, stats.total)}%
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Badge className={`${getStatusColor('approved')} flex items-center gap-1`}>
                  {getStatusIcon('approved')}
                  อนุมัติ
                </Badge>
              </div>
              <div className="text-2xl font-bold">{formatNumber(stats.approved)}</div>
              <div className="text-xs text-muted-foreground">
                {calculatePercentage(stats.approved, stats.total)}%
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Badge className={`${getStatusColor('rejected')} flex items-center gap-1`}>
                  {getStatusIcon('rejected')}
                  ปฏิเสธ
                </Badge>
              </div>
              <div className="text-2xl font-bold">{formatNumber(stats.rejected)}</div>
              <div className="text-xs text-muted-foreground">
                {calculatePercentage(stats.rejected, stats.total)}%
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Badge className={`${getStatusColor('completed')} flex items-center gap-1`}>
                  {getStatusIcon('completed')}
                  สำเร็จ
                </Badge>
              </div>
              <div className="text-2xl font-bold">{formatNumber(stats.completed)}</div>
              <div className="text-xs text-muted-foreground">
                {calculatePercentage(stats.completed, stats.total)}%
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Badge className={`${getStatusColor('cancelled')} flex items-center gap-1`}>
                  {getStatusIcon('cancelled')}
                  ยกเลิก
                </Badge>
              </div>
              <div className="text-2xl font-bold">{formatNumber(stats.cancelled)}</div>
              <div className="text-xs text-muted-foreground">
                {calculatePercentage(stats.cancelled, stats.total)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            เปรียบเทียบรายเดือน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{formatNumber(stats.thisMonth)}</div>
              <div className="text-sm text-muted-foreground">เดือนนี้</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{formatNumber(stats.lastMonth)}</div>
              <div className="text-sm text-muted-foreground">เดือนที่แล้ว</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-muted-foreground">
              {stats.thisMonth > stats.lastMonth ? (
                <span className="text-green-600">
                  +{formatNumber(stats.thisMonth - stats.lastMonth)} จากเดือนที่แล้ว
                </span>
              ) : (
                <span className="text-red-600">
                  -{formatNumber(stats.lastMonth - stats.thisMonth)} จากเดือนที่แล้ว
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 