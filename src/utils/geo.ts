// Distância aproximada em km entre duas coordenadas (fórmula de Haversine).
export function distanceKm(
  a: { lat: number; lng: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.lat) * Math.PI) / 180;
  const dLon = ((b.longitude - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// Traz qualquer longitude de volta para o intervalo padrão -180..180.
// Necessário porque o Leaflet permite arrastar o mapa continuamente pelo
// globo, então bounds.getWest()/getEast() podem vir como -190, 200 etc.
// A OpenSky só entende o intervalo padrão.
export function normalizeLon(lon: number): number {
  return ((((lon + 180) % 360) + 360) % 360) - 180;
}

const EDGE_THRESHOLD_DEG = 30;

// Para aviões perto do antimeridiano (±180°), devolve mais de uma posição
// de desenho (a real + uma "sombra" deslocada 360° pro outro lado). Assim,
// quando o mapa mostra a cópia adjacente do mundo, o avião aparece
// continuamente em vez de sumir numa borda e reaparecer na outra.
export function getRenderPositions(lat: number, lon: number): [number, number][] {
  const positions: [number, number][] = [[lat, lon]];
  if (lon > 180 - EDGE_THRESHOLD_DEG) {
    positions.push([lat, lon - 360]);
  } else if (lon < -180 + EDGE_THRESHOLD_DEG) {
    positions.push([lat, lon + 360]);
  }
  return positions;
}
