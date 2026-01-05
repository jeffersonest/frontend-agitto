"use client";
import { useEffect, useRef } from "react";
import { getTokenInfo } from "@/lib/auth/token";
import { getApiBaseUrl } from "@/lib/config";
import { setAccessToken } from "@/lib/api/http";

/**
 * SessionRefresher component
 * Automatically refreshes JWT before expiration
 * - Checks every 5 minutes
 * - Refreshes when less than 30 minutes remaining
 * - Also refreshes on window focus/visibility change
 */
export default function SessionRefresher() {
  const ticking = useRef(false);
  
  useEffect(() => {
    async function maybeRefresh() {
      if (ticking.current) return;
      
      const info = getTokenInfo();
      
      // Refresh if expired OR less than 30 minutes remaining (was 1 minute)
      const thirtyMinutes = 30 * 60 * 1000;
      const shouldRefresh = !info.token || info.expired || info.remainingMs < thirtyMinutes;
      
      if (shouldRefresh) {
        ticking.current = true;
        try {
          console.log("🔄 Refreshing session token...");
          const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, { 
            method: "POST", 
            credentials: "include", 
            headers: { "Content-Type": "application/json" } 
          });
          const data = await res.json().catch(() => undefined);
          if (res.ok) {
            const next = (data && (data.accessToken || data.token)) as string | undefined;
            if (next) {
              setAccessToken(next);
              console.log("✅ Session refreshed successfully");
            }
          } else {
            console.warn("⚠️ Session refresh failed:", res.status);
          }
        } catch (error) {
          console.error("❌ Error refreshing session:", error);
        } finally {
          ticking.current = false;
        }
      }
    }
    
    // Check every 5 minutes (was 30 seconds)
    const id = setInterval(maybeRefresh, 5 * 60 * 1000);
    
    // Also check on focus/visibility
    const onFocus = () => { maybeRefresh(); };
    window.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    
    // Initial check
    maybeRefresh();
    
    return () => { 
      clearInterval(id); 
      window.removeEventListener("visibilitychange", onFocus); 
      window.removeEventListener("focus", onFocus); 
    };
  }, []);
  
  return null;
}

