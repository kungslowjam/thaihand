import React from 'react';
import RequestCard from './RequestCard';

// ตัวอย่างข้อมูลสำหรับ RequestCard
const sampleRequests = [
  {
    id: 1,
    title: "สินค้าทั่วไป",
    from_location: "Melbourne, Australia",
    to_location: "Melbourne, Australia",
    deadline: "2025-07-31",
    close_date: "2025-07-31",
    budget: 1500,
    description: "ไม่มีรายละเอียดเพิ่มเติม",
    image: "/default-product.jpg",
    status: "รออนุมัติ",
    user: "kungslowjam",
    user_email: "kungslowjam@example.com",
    user_image: null,
    carrier_name: "SIAM",
    carrier_email: "siam@example.com",
    carrier_phone: "kungslowjam",
    carrier_image: null,
    offer_id: 1,
    source: "marketplace",
    created_at: "2025-01-15T10:30:00Z",
    updated_at: "2025-01-15T10:30:00Z",
    urgent: false,
    weight: 2,
    amount: 1,
    note: "-",
    payment_status: "รอชำระเงิน",
    shipping_status: "รอจัดส่ง",
    rating: 4.5,
    review_count: 12,
    pickup_place: "SIAM",
    contact: "kungslowjam"
  },
  {
    id: 2,
    title: "ไดฟูกุ",
    from_location: "Tokyo, Japan",
    to_location: "Bangkok, Thailand",
    deadline: "2025-02-15",
    close_date: "2025-02-10",
    budget: 2500,
    description: "ไดฟูกุสดจากญี่ปุ่น",
    image: "/default-product.jpg",
    status: "อนุมัติ",
    user: "japan_fan",
    user_email: "japan_fan@example.com",
    user_image: null,
    carrier_name: "Central World",
    carrier_email: "central@example.com",
    carrier_phone: "japan_fan",
    carrier_image: null,
    offer_id: 2,
    source: "marketplace",
    created_at: "2025-01-10T14:20:00Z",
    updated_at: "2025-01-12T09:15:00Z",
    urgent: true,
    weight: 1.5,
    amount: 2,
    note: "ต้องการไดฟูกุสดเท่านั้น",
    payment_status: "ชำระแล้ว",
    shipping_status: "กำลังจัดส่ง",
    rating: 4.8,
    review_count: 25,
    pickup_place: "Central World",
    contact: "japan_fan"
  },
  {
    id: 3,
    title: "ช็อกโกแลต",
    from_location: "Paris, France",
    to_location: "Bangkok, Thailand",
    deadline: "2025-03-20",
    close_date: "2025-03-15",
    budget: 1800,
    description: "ช็อกโกแลตจากฝรั่งเศส",
    image: "/default-product.jpg",
    status: "รออนุมัติ",
    user: "chocolate_lover",
    user_email: "chocolate_lover@example.com",
    user_image: null,
    carrier_name: "Siam Paragon",
    carrier_email: "paragon@example.com",
    carrier_phone: "chocolate_lover",
    carrier_image: null,
    offer_id: 3,
    source: "marketplace",
    created_at: "2025-01-20T16:45:00Z",
    updated_at: "2025-01-20T16:45:00Z",
    urgent: false,
    weight: 3,
    amount: 5,
    note: "ต้องการช็อกโกแลตดำ",
    payment_status: "รอชำระเงิน",
    shipping_status: "รอจัดส่ง",
    rating: 4.2,
    review_count: 8,
    pickup_place: "Siam Paragon",
    contact: "chocolate_lover"
  }
];

export default function RequestCardExample() {
  const handleView = (id: number) => {
    console.log('View request:', id);
  };

  const handleContact = (id: number) => {
    console.log('Contact request:', id);
  };

  const handleBookmark = (id: number) => {
    console.log('Bookmark request:', id);
  };

  const handleShare = (id: number) => {
    console.log('Share request:', id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          ตัวอย่าง RequestCard ใหม่
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              mode="view"
              onView={handleView}
              onContact={handleContact}
              onBookmark={handleBookmark}
              onShare={handleShare}
              isBookmarked={false}
              showActions={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 