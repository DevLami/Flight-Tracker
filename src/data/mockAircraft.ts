import type { Aircraft } from "../types/opensky";

/**
 * Gera aeronaves fictícias espalhadas ao redor de um centro, para uso como
 * fallback quando a OpenSky Network está inacessível (rede bloqueada, API
 * fora do ar, etc.) — assim a interface continua demonstrável.
 */
export function generateMockAircraft(center: { lat: number; lng: number }): Aircraft[] {
  const template: Omit<Aircraft, "latitude" | "longitude">[] = [
    { icao24: "e48f21", callsign: "TAM3402", originCountry: "Brazil", altitude: 11280, velocity: 232, heading: 45, verticalRate: 0, onGround: false },
    { icao24: "e4a1b0", callsign: "AZU4108", originCountry: "Brazil", altitude: 10515, velocity: 215, heading: 190, verticalRate: -2, onGround: false },
    { icao24: "e4c930", callsign: "GLO1745", originCountry: "Brazil", altitude: 0, velocity: 0, heading: 270, verticalRate: 0, onGround: true },
    { icao24: "e4d112", callsign: "TAM8821", originCountry: "Brazil", altitude: 9800, velocity: 198, heading: 120, verticalRate: 5, onGround: false },
    { icao24: "e4e004", callsign: "PTREP", originCountry: "Brazil", altitude: 3200, velocity: 140, heading: 300, verticalRate: -3, onGround: false },
  ];

  return template.map((t, i) => {
    const angle = (i / template.length) * Math.PI * 2;
    const radius = 0.6; // ~graus de distância do centro
    return {
      ...t,
      latitude: center.lat + Math.sin(angle) * radius,
      longitude: center.lng + Math.cos(angle) * radius,
    };
  });
}
