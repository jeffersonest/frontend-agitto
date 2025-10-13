import { getApiBaseUrl } from "@/lib/config";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("agitto:accessToken", token);
    else localStorage.removeItem("agitto:accessToken");
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("agitto:accessToken");
    accessToken = stored || null;
    return accessToken;
  }
  return null;
}

type HttpOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
};

export async function http<T = unknown>(path: string, opts: HttpOptions = {}): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  async function doFetch(currentHeaders: Record<string, string>) {
    const response = await fetch(url, {
      method: opts.method || (opts.body ? "POST" : "GET"),
      headers: currentHeaders,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      credentials: "include",
      cache: "no-store",
    });
    const isJson = (response.headers.get("content-type") || "").includes("application/json");
    const payload = isJson ? await response.json().catch(() => undefined) : undefined;
    return { response, payload } as const;
  }

  let { response, payload } = await doFetch(headers);
  if (response.status === 401 && token) {
    try {
      const refreshRes = await fetch(`${base}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const refreshData = await refreshRes.json().catch(() => undefined);
      if (refreshRes.ok) {
        const nextToken = (refreshData && (refreshData.accessToken || refreshData.token)) as string | undefined;
        if (nextToken) {
          setAccessToken(nextToken);
          headers["Authorization"] = `Bearer ${nextToken}`;
          ({ response, payload } = await doFetch(headers));
        }
      } else {
        setAccessToken(null);
      }
    } catch {
      setAccessToken(null);
    }
  }

  if (!response.ok) {
    const message = (payload && (payload.message || payload.error)) || response.statusText;
    throw new Error(Array.isArray(message) ? message.join(", ") : String(message));
  }
  return payload as T;
}
