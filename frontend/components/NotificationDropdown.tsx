"use client"
import { useNotificationStore } from '../store/notificationStore';
import { useState, useRef, useEffect } from 'react';

export default function NotificationDropdown() {
  const notifications = useNotificationStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // ปิด dropdown เมื่อคลิกนอก component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        className="relative p-2"
        onClick={() => setOpen((v) => !v)}
        aria-label="แจ้งเตือน"
      >
        <span role="img" aria-label="แจ้งเตือน">🔔</span>
        {unread > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded z-20 p-2">
          {notifications.length === 0 ? (
            <div className="text-gray-400 text-center py-4">ไม่มีแจ้งเตือน</div>
          ) : (
            notifications.slice(0, 5).map((n) => (
              <div
                key={n.id}
                className={`p-2 border-b last:border-b-0 ${n.read ? 'text-gray-500' : 'font-bold'} cursor-pointer`}
                onClick={() => {
                  if (n.link) window.location.href = n.link;
                  useNotificationStore.getState().markAsRead(n.id);
                  setOpen(false);
                }}
              >
                {n.message}
              </div>
            ))
          )}
          <a
            href="/notifications"
            className="block text-blue-500 mt-2 text-sm text-center hover:underline"
          >
            ดูทั้งหมด
          </a>
        </div>
      )}
    </div>
  );
} 