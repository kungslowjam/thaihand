import { create } from 'zustand';

export type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string; // เพิ่ม field link สำหรับลิงก์รายละเอียด
};

type State = {
  notifications: Notification[];
  add: (n: Notification) => void;
  markAsRead: (id: string) => void;
  unreadCount: () => number;
};

export const useNotificationStore = create<State>((set, get) => ({
  notifications: [],
  add: (n) => set((state) => ({ notifications: [n, ...state.notifications] })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
})); 