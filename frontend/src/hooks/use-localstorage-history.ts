'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Persists a list of recently-entered string values to localStorage.
 * Most recent entry is first. Duplicates are collapsed case-insensitively.
 *
 * SSR-safe: starts empty on server, hydrates from localStorage after mount.
 */
export function useLocalStorageHistory(key: string, maxItems = 50) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setHistory(
          parsed.filter((x): x is string => typeof x === 'string').slice(0, maxItems),
        );
      }
    } catch {
      // corrupted JSON or storage unavailable -> start fresh
    }
  }, [key, maxItems]);

  const addEntry = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      setHistory((prev) => {
        const lower = trimmed.toLowerCase();
        const deduped = prev.filter((v) => v.toLowerCase() !== lower);
        const next = [trimmed, ...deduped].slice(0, maxItems);
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // quota exceeded or storage unavailable -> in-memory only
        }
        return next;
      });
    },
    [key, maxItems],
  );

  return { history, addEntry };
}
