import { useEffect } from 'react';
import { AuthService } from '../services/auth';

interface SimpleLocationsOnceProps {
  url?: string;                 // デフォルト /get_locations
  logPrefix?: string;           // ログ識別用
  enabled?: boolean;            // false で何もしない
}

// 一度だけAPIを叩いてJSONをconsole.logする最小コンポーネント
export default function SimpleLocationsOnce({
  url = 'http://localhost:50052/get_locations',
  logPrefix = 'SimpleLocationsOnce',
  enabled = true,
}: SimpleLocationsOnceProps) {
  useEffect(() => {
    if (!enabled) return;
    let aborted = false;
    const controller = new AbortController();
    (async () => {
      try {
        const { token } = AuthService.getAuthData();
        const resp = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          signal: controller.signal,
        });
        const text = await resp.text();
        let json: any = null;
        try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }
        if (!aborted) {
          // eslint-disable-next-line no-console
          console.log(`[${logPrefix}] status=${resp.status} ok=${resp.ok}`, json);
        }
      } catch (e: any) {
        if (aborted || e?.name === 'AbortError') return;
        // eslint-disable-next-line no-console
        console.error(`[${logPrefix}] error`, e);
      }
    })();
    return () => {
      aborted = true;
      controller.abort();
    };
  }, [url, logPrefix, enabled]);
  return null;
}
