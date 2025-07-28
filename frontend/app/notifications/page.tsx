"use client"
import { useNotificationStore } from '../../store/notificationStore';
import { Bell, CheckCircle2, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useMemo } from "react";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const notifications = useNotificationStore((s) => s.notifications);
  const setNotifications = useNotificationStore((s) => s.set);
  const removeNotification = useNotificationStore((s) => s.remove);
  const clearNotifications = useNotificationStore((s) => s.clear);

  // Clear store เมื่อ session เปลี่ยน
  useEffect(() => {
    if (session) {
      clearNotifications(); // Clear store
    }
  }, [session, clearNotifications]);

  // Deduplicate notifications โดยใช้ id
  const uniqueNotifications = useMemo(() => {
    const seen = new Set();
    return notifications.filter(n => {
      if (seen.has(n.id)) {
        return false;
      }
      seen.add(n.id);
      return true;
    });
  }, [notifications]);

  useEffect(() => {
    let email = session?.user?.email;
    if (!email && session?.provider === 'line' && session?.user?.id) {
      email = `${session.user.id}@line`;
    }
    if (email) {
      fetch(`/api/notifications?user_email=${email}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setNotifications(data);
        });
    }
  }, [session, setNotifications]);

  return (
    <>
      <div className="min-h-[80vh] w-full bg-gradient-to-b from-blue-50 to-white py-10 px-2">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center tracking-tight">
            แจ้งเตือน
          </h1>
          <div className="bg-white rounded-2xl shadow-xl p-0 sm:p-2">
            {uniqueNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Bell size={64} className="text-blue-300 mb-4" />
                <span className="text-gray-400 text-lg">ไม่มีแจ้งเตือน</span>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {uniqueNotifications.map((n, index) => (
                  <li
                    key={`${n.id}-${index}`}
                    className={`flex items-center gap-4 px-4 py-5 transition hover:bg-blue-50/60 cursor-pointer ${n.read ? 'opacity-70' : ''} relative`}
                    onClick={() => {
                      if (n.link) window.location.href = n.link;
                      useNotificationStore.getState().markAsRead(n.id);
                    }}
                  >
                    {/* ปุ่มปิด */}
                    <button
                      className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full transition-colors z-10"
                      onClick={(e) => {
                        e.stopPropagation(); // ป้องกันการ trigger onClick ของ parent
                        removeNotification(n.id);
                      }}
                      aria-label="ปิดแจ้งเตือน"
                    >
                      <X size={16} className="text-gray-400 hover:text-gray-600" />
                    </button>

                    <div>
                      {n.read ? (
                        <CheckCircle2 size={28} className="text-green-400" />
                      ) : (
                        <Bell size={28} className="text-blue-500 animate-bounce" />
                      )}
                    </div>
                    
                    {/* รูป profile ของคนฝาก */}
                    <div className="flex-shrink-0">
                      <img 
                        src={n.sender_image || "/thaihand-logo.png"} 
                        alt="profile" 
                        className="w-10 h-10 rounded-full border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = "/thaihand-logo.png";
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 pr-8">
                      <div className={`text-base ${n.read ? 'text-gray-500' : 'font-semibold text-gray-800'}`}>
                        {n.message}
                      </div>
                      {n.sender_name && (
                        <div className="text-sm text-gray-600 mt-1">
                          จาก: {n.sender_name}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(n.created_at || n.createdAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                    </div>
                    {!n.read && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                        ใหม่
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 