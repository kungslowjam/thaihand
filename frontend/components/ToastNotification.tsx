"use client";
import { useNotificationStore } from '../store/notificationStore';
import { useEffect } from 'react';

export default function ToastNotification({ enable }: { enable: boolean }) {
  const notifications = useNotificationStore((s) => s.notifications);
  const latest = notifications.find((n) => !n.read);

  useEffect(() => {
    if (enable && latest) {
      // ระบบแจ้งเตือนถูกปิดใช้งานชั่วคราว
      console.log('Notification:', latest.message);
      useNotificationStore.getState().markAsRead(latest.id);
    }
  }, [latest, enable]);

  return null;
} 