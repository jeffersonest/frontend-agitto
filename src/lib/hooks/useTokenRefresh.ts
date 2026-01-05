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

/**
 * Hook to automatically refresh JWT tokens before expiration
 * - Checks every 5 minutes
 * - Refreshes when less than 30 minutes remaining (was 5 minutes)
 * - Better for longer sessions
 */
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
      const thirtyMinutes = 30 * 60 * 1000;

      // Refresh when less than 30 minutes remaining (more proactive)
      if (timeUntilExpiry < thirtyMinutes && timeUntilExpiry > 0) {
        try {
          console.log('🔄 Refreshing token (expires in', Math.floor(timeUntilExpiry / 60000), 'minutes)');
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
              console.log('✅ Token refreshed successfully');
            }
          } else {
            console.warn('⚠️ Token refresh failed:', response.status);
            setAccessToken(null);
          }
        } catch (error) {
          console.error('❌ Token refresh error:', error);
        }
      }
    }

    refreshToken();
    // Check every 5 minutes (was 1 minute)
    intervalRef.current = setInterval(refreshToken, 5 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}
