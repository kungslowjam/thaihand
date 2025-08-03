import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useBackendToken() {
  const { data: session, status } = useSession();
  const [backendToken, setBackendToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // รอให้ session โหลดเสร็จ
    if (status === "loading") {
      return;
    }

    // ถ้าไม่มี session ให้ reset token
    if (!session) {
      setBackendToken(null);
      setError(null);
      return;
    }

    const accessToken = (session as any)?.accessToken;
    const provider = (session as any)?.provider || "google";
    
          console.log("Session data:", session);
      console.log("Access token:", accessToken);
      console.log("Provider:", provider);
      console.log("User email:", session?.user?.email);
    
    if (accessToken && !backendToken) {
      setLoading(true);
      setError(null);
      
      console.log("SESSION_USER", session?.user);
      console.log("myUserId", (session as any)?.user?.id);
      
      // Use environment variable for API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://thaihand.shop/api';
      console.log("API URL:", apiUrl);
      
      const requestBody = { 
        accessToken, 
        provider,
        email: session?.user?.email 
      };
      console.log("Request body for auth exchange:", requestBody);
      
      fetch(`${apiUrl}/auth/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log("Backend response:", data); // Debug log
          if (data.accessToken) {
            setBackendToken(data.accessToken);
            console.log("Backend token obtained successfully:", data.accessToken.substring(0, 20) + "...");
          } else {
            console.error("No access token in response:", data);
            throw new Error("No access token in response");
          }
        })
        .catch(err => {
          console.error("Error getting backend token:", err);
          setError(err.message);
          // Retry after 5 seconds for token errors
          setTimeout(() => {
            setLoading(false);
          }, 5000);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [session, status, backendToken]);

  console.log("useBackendToken - Current state:", { 
    backendToken: backendToken ? `${backendToken.substring(0, 20)}...` : null, 
    loading, 
    error 
  });
  
  return { backendToken, loading, error };
} 