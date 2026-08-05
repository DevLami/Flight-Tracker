import type { Aircraft, BoundingBox, OpenSkyStatesResponse, OpenSkyStateVectorRaw } from "../types/opensky";

// Em desenvolvimento, essa rota é redirecionada pelo proxy do Vite (ver vite.config.ts)
// para contornar a falta de CORS na API da OpenSky. Em produção, será necessário
// um proxy próprio (função serverless, Cloudflare Worker, etc.) apontando pra
// https://opensky-network.org/api/states/all — o navegador não conseguirá chamar
// a OpenSky diretamente em nenhum ambiente.
const BASE_URL = "/opensky-api/states/all";

function normalize(raw: OpenSkyStateVectorRaw): Aircraft | null {
  const [icao24, callsign, originCountry, , , longitude, latitude, baroAltitude, onGround, velocity, trueTrack, verticalRate] = raw;

  // Descarta registros sem posição válida (acontece com frequência na API)
  if (latitude === null || longitude === null) return null;

  return {
    icao24,
    callsign: callsign?.trim() || "SEM CALLSIGN",
    originCountry,
    latitude,
    longitude,
    altitude: baroAltitude,
    velocity,
    heading: trueTrack,
    verticalRate,
    onGround,
  };
}

/**
 * Busca os aviões dentro de uma área (bounding box).
 * Sem autenticação, a OpenSky limita bastante as chamadas (poucas por minuto),
 * então é importante sempre restringir por bbox em vez de buscar o globo todo.
 */
export async function fetchAircraftInBounds(bbox: BoundingBox, signal?: AbortSignal): Promise<Aircraft[]> {
  const params = new URLSearchParams({
    lamin: bbox.latMin.toFixed(4),
    lamax: bbox.latMax.toFixed(4),
    lomin: bbox.lonMin.toFixed(4),
    lomax: bbox.lonMax.toFixed(4),
  });

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}?${params.toString()}`, { signal });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new Error(
      "Não foi possível conectar à OpenSky (verifique se o servidor de desenvolvimento está rodando com o proxy configurado)."
    );
  }

  if (res.status === 429) {
    throw new Error("Limite de requisições da OpenSky atingido. Aguarde um momento.");
  }
  if (!res.ok) {
    throw new Error(`Falha ao consultar a OpenSky Network (HTTP ${res.status})`);
  }

  const data: OpenSkyStatesResponse = await res.json();
  if (!data.states) return [];

  return data.states
    .map(normalize)
    .filter((a): a is Aircraft => a !== null);
}
