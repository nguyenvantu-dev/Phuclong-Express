'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getQnaList } from '@/lib/api';

const POLL_INTERVAL_MS = 60_000;

/** Polls the count of unanswered Q&A questions every 60s for the admin sidebar badge. */
export function useQnaBadgeCount(enabled = true) {
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      const res = await getQnaList({ daTraLoi: 0, limit: 1, page: 1 });
      setCount(res.total);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    fetchCount();
    intervalRef.current = setInterval(fetchCount, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchCount, enabled]);

  return count;
}
