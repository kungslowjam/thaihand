import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useBackendToken() {
  const { data: session } = useSession();
  const [backendToken, setBackendToken] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = (session as any)?.accessToken;
    // ดึง provider จาก session
    const provider = (session as any)?.user?.provider || (session as any)?.provider || "google";
    if (accessToken) {
      fetch("http://localhost:8000/api/auth/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, provider })
      })
        .then(res => res.json())
        .then(data => {
          if (data.accessToken) setBackendToken(data.accessToken);
        });
    }
  }, [session]);

  return backendToken;
} 