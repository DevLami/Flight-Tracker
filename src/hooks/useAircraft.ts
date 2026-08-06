import { useEffect, useRef, useState } from "react";
import { fetchAircraftInBounds } from "../api/opensky";
import { generateMockAircraft } from "../data/mockAircraft";
import type { Aircraft, BoundingBox } from "../types/opensky";

const POLL_INTERVAL_MS = 15_000;
// Depois de tantas falhas seguidas, assume que a OpenSky está inacessível
// (rede bloqueada, API fora do ar) e passa a mostrar dados de demonstração.
const FAILURES_BEFORE_FALLBACK = 2;

interface UseAircraftResult {
  aircraft: Aircraft[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isMock: boolean;
}

/**
 * Busca e atualiza periodicamente os aviões dentro do bounding box informado.
 * Refaz a busca sempre que o bbox muda (ex.: usuário move o mapa) e a cada
 * POLL_INTERVAL_MS enquanto o bbox permanece o mesmo. Se a OpenSky falhar
 * repetidamente, cai para dados fictícios (isMock=true) pra não travar a UI.
 */
export function useAircraft(bbox: BoundingBox | null): UseAircraftResult {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isMock, setIsMock] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const failureCountRef = useRef(0);

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
        failureCountRef.current = 0;
        setAircraft(result);
        setError(null);
        setIsMock(false);
        setLastUpdated(new Date());
      } catch (err) {
        if (cancelled || (err as Error).name === "AbortError") return;

        failureCountRef.current += 1;
        setError((err as Error).message);

        if (failureCountRef.current >= FAILURES_BEFORE_FALLBACK) {
          const center = {
            lat: (bbox!.latMin + bbox!.latMax) / 2,
            lng: (bbox!.lonMin + bbox!.lonMax) / 2,
          };
          setAircraft(generateMockAircraft(center));
          setIsMock(true);
          setLastUpdated(new Date());
        }
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

  return { aircraft, loading, error, lastUpdated, isMock };
}
