"use client";
import { useNotificationStore } from '../store/notificationStore';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function ToastNotification() {
  const notifications = useNotificationStore((s) => s.notifications);
  const latest = notifications.find((n) => !n.read);

  useEffect(() => {
    if (latest) {
      toast(latest.message, {
        action: latest.link ? {
          label: 'ดูรายละเอียด',
          onClick: () => {
            window.location.href = latest.link!;
          }
        } : undefined
      });
      useNotificationStore.getState().markAsRead(latest.id);
    }
  }, [latest]);

  return null;
} 