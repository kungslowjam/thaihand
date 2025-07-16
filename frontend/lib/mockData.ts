// mockData.ts
export const mockRequests = [
  { id: 1, title: "ขนมญี่ปุ่น", from: "Osaka", to: "Bangkok", price: 250, status: "รอรับหิ้ว", date: "2024-07-10", user: "Aom", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=facearea&w=400&q=80", isNew: true, isHot: false },
  { id: 2, title: "วิตามินออสเตรเลีย", from: "Melbourne", to: "Bangkok", price: 300, status: "สำเร็จ", date: "2024-07-01", user: "Bee", image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=facearea&w=400&q=80", isNew: false, isHot: true },
];
export const mockOffers = [
  { id: 1, route: "Melbourne → BKK", status: "เปิดรับฝาก", date: "2024-07-15", image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=400&q=80" },
  { id: 2, route: "BKK → Tokyo", status: "ปิดรับฝาก", date: "2024-06-20", image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=facearea&w=400&q=80" },
];
export const myOrders = [
  { id: 1, item: "ขนมญี่ปุ่น", status: "รอรับของ", fee: 300 },
  { id: 2, item: "วิตามิน", status: "สำเร็จ", fee: 500 },
  { id: 3, item: "เครื่องสำอาง", status: "รอจ่าย", fee: 400 },
];
export const mockFlights = [
  {
    id: '1',
    from: 'Bangkok',
    to: 'Sydney',
    departDate: '2024-07-18',
    closeDate: '2024-07-14',
    price: 500,
    unit: '2kg',
    status: 'ด่วน',
    isHot: true,
    maxWeight: 10,
    usedWeight: 8.5,
    note: 'รับเฉพาะของใหม่',
    ordersCount: 3,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=400&q=80',
    user: { name: 'Bee', avatar: '' },
    orders: [
      { id: 'a1', item: 'ขนมญี่ปุ่น', weight: 1.5, status: 'รอรับของ', fee: 300 },
      { id: 'a2', item: 'วิตามิน', weight: 2, status: 'สำเร็จ', fee: 500 },
    ]
  },
  {
    id: '2',
    from: 'Bangkok',
    to: 'Tokyo',
    departDate: '2024-07-15',
    closeDate: '2024-07-10',
    price: 300,
    unit: '1kg',
    status: '',
    isHot: false,
    maxWeight: 15,
    usedWeight: 4,
    note: '',
    ordersCount: 1,
    image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=facearea&w=400&q=80',
    user: { name: 'Somchai', avatar: '' },
    orders: [
      { id: 'b1', item: 'เครื่องสำอาง', weight: 0.8, status: 'รอรับของ', fee: 200 },
    ]
  },
]; 