import { useEffect, useRef } from 'react';
import { getAccessToken, setAccessToken } from '@/lib/api/http';
import { getApiBaseUrl } from '@/lib/config';

function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function useTokenRefresh() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function refreshToken() {
      const token = getAccessToken();
      if (!token) return;

      const payload = decodeJwt(token);
      if (!payload?.exp) return;

      const expiresAt = payload.exp * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      const fiveMinutes = 5 * 60 * 1000;

      if (timeUntilExpiry < fiveMinutes && timeUntilExpiry > 0) {
        try {
          const base = getApiBaseUrl();
          const response = await fetch(`${base}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });

          if (response.ok) {
            const data = await response.json();
            const newToken = data.accessToken || data.token;
            if (newToken) {
              setAccessToken(newToken);
            }
          } else {
            setAccessToken(null);
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }
    }

    refreshToken();
    intervalRef.current = setInterval(refreshToken, 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}
