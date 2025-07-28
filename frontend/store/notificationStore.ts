import { create } from 'zustand';

export type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  created_at?: string; // สำหรับ backend response
  link?: string; // เพิ่ม field link สำหรับลิงก์รายละเอียด
  sender_image?: string; // รูป profile ของคนฝาก
  sender_name?: string; // ชื่อของคนฝาก
  sender_email?: string; // email ของคนฝาก
};

type State = {
  notifications: Notification[];
  add: (n: Notification) => void;
  set: (notifications: Notification[]) => void;
  remove: (id: string) => void;
  clear: () => void;
  markAsRead: (id: string) => void;
  unreadCount: () => number;
};

export const useNotificationStore = create<State>((set, get) => ({
  notifications: [],
  add: (n) => set((state) => {
    // ตรวจสอบว่า notification นี้มีอยู่แล้วหรือไม่
    const exists = state.notifications.some(existing => existing.id === n.id);
    if (exists) {
      return state; // ไม่เพิ่มถ้ามีอยู่แล้ว
    }
    return { notifications: [n, ...state.notifications] };
  }),
  set: (notifications) => set({ notifications }),
  remove: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  clear: () => set({ notifications: [] }),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
})); 