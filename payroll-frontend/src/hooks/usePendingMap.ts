import { useCallback, useState } from "react";

export function usePendingMap<K extends string | number>() {
  const [pending, setPending] = useState<Record<string, boolean>>({});

  const isPending = useCallback(
    (key: K) => pending[String(key)] === true,
    [pending]
  );

  const run = useCallback(
    async (key: K, fn: () => Promise<void>) => {
      const k = String(key);
      if (pending[k]) return;

      setPending((p) => ({ ...p, [k]: true }));
      try {
        await fn();
      } finally {
        setPending((p) => ({ ...p, [k]: false }));
      }
    },
    [pending]
  );

  return { isPending, run };
}