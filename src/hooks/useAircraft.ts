import { useEffect, useRef, useState } from "react";
import { fetchAircraftInBounds } from "../api/opensky";
import type { Aircraft, BoundingBox } from "../types/opensky";

const POLL_INTERVAL_MS = 15_000;

interface UseAircraftResult {
  aircraft: Aircraft[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Busca e atualiza periodicamente os aviões dentro do bounding box informado.
 * Refaz a busca sempre que o bbox muda (ex.: usuário move o mapa) e a cada
 * POLL_INTERVAL_MS enquanto o bbox permanece o mesmo.
 */
export function useAircraft(bbox: BoundingBox | null): UseAircraftResult {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!bbox) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function load() {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const result = await fetchAircraftInBounds(bbox!, controller.signal);
        if (cancelled) return;
        setAircraft(result);
        setError(null);
        setLastUpdated(new Date());
      } catch (err) {
        if (cancelled || (err as Error).name === "AbortError") return;
        setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }

      if (!cancelled) {
        timer = setTimeout(load, POLL_INTERVAL_MS);
      }
    }

    load();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bbox?.latMin, bbox?.latMax, bbox?.lonMin, bbox?.lonMax]);

  return { aircraft, loading, error, lastUpdated };
}
