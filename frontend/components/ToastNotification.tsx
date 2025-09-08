"use client";
import { useNotificationStore } from '../store/notificationStore';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function ToastNotification({ enable }: { enable: boolean }) {
  const notifications = useNotificationStore((s) => s.notifications);
  const latest = notifications.find((n) => !n.read);

  useEffect(() => {
    if (enable && latest) {
      const icon = latest.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : latest.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />
      const show = latest.type === 'error' ? toast.error : latest.type === 'success' ? toast.success : toast.info
      show(latest.message, { icon })
      useNotificationStore.getState().markAsRead(latest.id);
    }
  }, [latest, enable]);

  return null;
} 