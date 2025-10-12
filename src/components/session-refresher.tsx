"use client";
import { useEffect, useRef } from "react";
import { getTokenInfo } from "@/lib/auth/token";
import { getApiBaseUrl } from "@/lib/config";
import { setAccessToken } from "@/lib/api/http";

export default function SessionRefresher() {
  const ticking = useRef(false);
  useEffect(() => {
    async function maybeRefresh() {
      if (ticking.current) return;
      const info = getTokenInfo();
      if (!info.token || info.expired || info.remainingMs < 60_000) {
        ticking.current = true;
        try {
          const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" } });
          const data = await res.json().catch(() => undefined);
          if (res.ok) {
            const next = (data && (data.accessToken || data.token)) as string | undefined;
            if (next) setAccessToken(next);
          }
        } catch {}
        ticking.current = false;
      }
    }
    const id = setInterval(maybeRefresh, 30_000);
    const onFocus = () => { maybeRefresh(); };
    window.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(id); window.removeEventListener("visibilitychange", onFocus); window.removeEventListener("focus", onFocus); };
  }, []);
  return null;
}

