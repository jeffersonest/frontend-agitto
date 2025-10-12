import { getAccessToken } from "@/lib/api/http";

type JwtPayload = { exp?: number; iat?: number; [k: string]: unknown };

function base64UrlDecode(s: string) {
  try {
    const t = s.replace(/-/g, "+").replace(/_/g, "/");
    const pad = t.length % 4 === 2 ? "==" : t.length % 4 === 3 ? "=" : "";
    const decoded = typeof atob !== "undefined" ? atob(t + pad) : Buffer.from(t + pad, "base64").toString("binary");
    const json = decodeURIComponent(Array.prototype.map.call(decoded, (c: string) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`).join(""));
    return json;
  } catch {
    return "{}";
  }
}

export function decodeJwt(token: string): JwtPayload {
  try {
    const payload = token.split(".")[1];
    if (!payload) return {};
    const json = base64UrlDecode(payload);
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function getTokenInfo() {
  const token = getAccessToken();
  if (!token) return { token: null as string | null, exp: null as number | null, iat: null as number | null, remainingMs: 0, expired: true };
  const p = decodeJwt(token);
  const now = Math.floor(Date.now() / 1000);
  const exp = typeof p.exp === "number" ? p.exp : null;
  const iat = typeof p.iat === "number" ? p.iat : null;
  const remainingMs = exp ? Math.max(0, (exp - now) * 1000) : 0;
  const expired = exp ? now >= exp : true;
  return { token, exp, iat, remainingMs, expired };
}

export function isTokenExpired(token?: string | null) {
  const info = token ? (() => { const p = decodeJwt(token); const now = Math.floor(Date.now()/1000); const exp = typeof p.exp === "number" ? p.exp : null; return { expired: exp ? now >= exp : true }; })() : getTokenInfo();
  return info.expired;
}

