"use client"
import { useNotificationStore } from '../../store/notificationStore';
import { Bell, CheckCircle2 } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const notifications = useNotificationStore((s) => s.notifications);

  return (
    <>
      <div className="min-h-[80vh] w-full bg-gradient-to-b from-blue-50 to-white py-10 px-2">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center tracking-tight">
            แจ้งเตือน
          </h1>
          <div className="bg-white rounded-2xl shadow-xl p-0 sm:p-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Bell size={64} className="text-blue-300 mb-4" />
                <span className="text-gray-400 text-lg">ไม่มีแจ้งเตือน</span>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`flex items-center gap-4 px-4 py-5 transition hover:bg-blue-50/60 cursor-pointer ${n.read ? 'opacity-70' : ''}`}
                    onClick={() => {
                      if (n.link) window.location.href = n.link;
                      useNotificationStore.getState().markAsRead(n.id);
                    }}
                  >
                    <div>
                      {n.read ? (
                        <CheckCircle2 size={28} className="text-green-400" />
                      ) : (
                        <Bell size={28} className="text-blue-500 animate-bounce" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-base ${n.read ? 'text-gray-500' : 'font-semibold text-gray-800'}`}>
                        {n.message}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
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