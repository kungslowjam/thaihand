import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from '@/store/userStore';

export function useSyncUserSession() {
  const { data: session } = useSession();
  const setUser = useUserStore((state) => state.setUser);
  useEffect(() => {
    if (session?.user) {
      setUser({
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        image: session.user.image ?? undefined,
      });
    }
  }, [session, setUser]);
} 