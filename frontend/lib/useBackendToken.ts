import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useBackendToken() {
  const { data: session } = useSession();
  const [backendToken, setBackendToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = (session as any)?.accessToken;
    const provider = (session as any)?.user?.provider || (session as any)?.provider || "google";
    
    if (accessToken && !backendToken) {
      setLoading(true);
      setError(null);
      
      // Use environment variable for API URL
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, provider })
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (data.accessToken) {
            setBackendToken(data.accessToken);
            console.log("Backend token obtained successfully");
          } else {
            throw new Error("No access token in response");
          }
        })
        .catch(err => {
          console.error("Error getting backend token:", err);
          setError(err.message);
          // Retry after 3 seconds
          setTimeout(() => {
            setLoading(false);
          }, 3000);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [session, backendToken]);

  return { backendToken, loading, error };
} 