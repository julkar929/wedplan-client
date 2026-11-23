'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

/** Small data-fetching hook: loading / error / refetch, aborts stale requests. */
export function useApi<T>(path: string | null, options: { auth?: boolean } = {}) {
  const { auth = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!!path);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) { setLoading(false); return; }
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    api<T>(path, { auth, signal: ctrl.signal })
      .then((d) => setData(d))
      .catch((e) => { if (e?.name !== 'AbortError') setError(e?.message || 'Something went wrong.'); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [path, auth, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, refetch, setData };
}
