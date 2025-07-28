"use client"
import { useNotificationStore } from '../store/notificationStore';
import { useState, useRef, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { Bell, X } from "lucide-react";
// import ToastNotification from "./ToastNotification"; // ลบออก

export default function NotificationDropdown() {
  const notifications = useNotificationStore((s) => s.notifications);
  const addNotification = useNotificationStore((s) => s.add);
  const removeNotification = useNotificationStore((s) => s.remove);
  const clearNotifications = useNotificationStore((s) => s.clear);
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef("1970-01-01T00:00:00");
  const userId = (session as any)?.user?.id;
  const unread = notifications.filter((n) => !n.read).length;
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);

  // Clear store และ reset lastTimeRef เมื่อ session เปลี่ยน
  useEffect(() => {
    if (session) {
      clearNotifications(); // Clear store
      lastTimeRef.current = "1970-01-01T00:00:00"; // Reset lastTime
    }
  }, [session, clearNotifications]);

  // Fetch รอบแรก (ไม่ show toast)
  useEffect(() => {
    if (session) {
      clearNotifications();
      lastTimeRef.current = "1970-01-01T00:00:00";
      let email = session.user?.email;
      if (!email && session.provider === "line" && session.user?.id) {
        email = `${session.user.id}@line`;
      }
      if (email) {
        fetch(`/api/notifications?user_email=${email}`)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              data.forEach((n) => addNotification(n));
            }
            setHasFetchedInitial(true); // mark ว่า fetch รอบแรกเสร็จแล้ว
          });
      }
    }
  }, [session, clearNotifications, addNotification]);

  // Long polling แจ้งเตือน (เฉพาะรอบหลังจาก fetch initial)
  useEffect(() => {
    let cancelled = false;
    // รองรับ Line login ที่ไม่มี email แต่มี pseudo-email
    let email = session?.user?.email;
    if (!email && session?.provider === 'line' && session?.user?.id) {
      email = `${session.user.id}@line`; // สร้าง pseudo-email สำหรับ Line
    }
    console.log("[DEBUG] userEmail for longpoll:", email);
    
    async function poll() {
      while (!cancelled && email && hasFetchedInitial) { // เพิ่มเงื่อนไข hasFetchedInitial
        try {
          console.log("[DEBUG] lastTime before fetch:", lastTimeRef.current);
          const res = await fetch(`/api/notifications/longpoll?user_email=${email}&last_time=${lastTimeRef.current}`);
          const data = await res.json();
          console.log("[DEBUG] response:", data);
          if (data.notifications && data.notifications.length > 0) {
            // หา created_at ที่มากที่สุด
            const maxTime = data.notifications.reduce(
              (max: string, n: any) => n.created_at > max ? n.created_at : max,
              lastTimeRef.current
            );
            lastTimeRef.current = maxTime;
            console.log("[DEBUG] NEW NOTIFICATIONS", data.notifications);
            
            // เพิ่มเฉพาะ notification ที่ไม่มีใน store แล้ว
            data.notifications.forEach((n: any) => {
              const exists = notifications.some(existing => existing.id === n.id);
              if (!exists) {
                addNotification(n);
              }
            });
          }
        } catch (e) { console.error("[DEBUG] longpoll error", e); }
      }
    }
    if (email && hasFetchedInitial) poll(); // เพิ่มเงื่อนไข hasFetchedInitial
    return () => { cancelled = true; };
  }, [session, addNotification, hasFetchedInitial]); // เพิ่ม hasFetchedInitial ใน dependency

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
        <Bell size={24} />
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
                         notifications.slice(0, 5).map((n) => {
               // แปลงวันที่ให้ถูกต้อง
               const date = new Date(n.created_at || "");
               const dateStr = isNaN(date.getTime()) ? "" : date.toLocaleString("th-TH", { 
                 dateStyle: "medium", 
                 timeStyle: "short" 
               });
              
              return (
                <div
                  key={n.id}
                  className={`p-3 border-b last:border-b-0 ${n.read ? 'text-gray-500' : 'font-bold'} cursor-pointer hover:bg-gray-50 relative`}
                  onClick={() => {
                    if (n.link) window.location.href = n.link;
                    useNotificationStore.getState().markAsRead(n.id);
                    setOpen(false);
                  }}
                >
                  {/* ปุ่มปิด */}
                  <button
                    className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    onClick={(e) => {
                      e.stopPropagation(); // ป้องกันการ trigger onClick ของ parent
                      removeNotification(n.id);
                    }}
                    aria-label="ปิดแจ้งเตือน"
                  >
                    <X size={14} className="text-gray-400 hover:text-gray-600" />
                  </button>
                  
                  <div className="flex items-start gap-3 pr-6">
                    {/* รูป profile ของคนฝาก */}
                    <img 
                      src={n.sender_image || "/thaihand-logo.png"} 
                      alt="profile" 
                      className="w-8 h-8 rounded-full border"
                      onError={(e) => {
                        e.currentTarget.src = "/thaihand-logo.png";
                      }}
                    />
                    <div className="flex-1">
                      <div className="text-sm">{n.message}</div>
                      {n.sender_name && (
                        <div className="text-xs text-gray-500 mt-1">
                          จาก: {n.sender_name}
                        </div>
                      )}
                      {dateStr && (
                        <div className="text-xs text-gray-400 mt-1">
                          {dateStr}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
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