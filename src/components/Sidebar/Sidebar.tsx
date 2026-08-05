import "./Sidebar.css";
import type { Aircraft } from "../../types/opensky";

const MAX_LISTED = 15;

interface SidebarProps {
  aircraft: Aircraft[];
  center: { lat: number; lng: number };
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Distância aproximada em km entre duas coordenadas (fórmula de Haversine).
function distanceKm(a: { lat: number; lng: number }, b: { latitude: number; longitude: number }) {
  const R = 6371;
  const dLat = ((b.latitude - a.lat) * Math.PI) / 180;
  const dLon = ((b.longitude - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function formatAltitude(meters: number | null) {
  if (meters === null) return "—";
  return `${Math.round(meters * 3.28084).toLocaleString("pt-BR")} ft`;
}

function formatSpeed(mps: number | null) {
  if (mps === null) return "—";
  return `${Math.round(mps * 1.94384)} kt`;
}

export default function Sidebar({ aircraft, center, loading, error, lastUpdated }: SidebarProps) {
  const nearest = [...aircraft]
    .sort((a, b) => distanceKm(center, a) - distanceKm(center, b))
    .slice(0, MAX_LISTED);

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <h2 className="sidebar__title">Voos monitorados</h2>
        <span className="sidebar__count">{aircraft.length}</span>
      </div>

      {loading && aircraft.length === 0 && (
        <div className="sidebar__state">Buscando aeronaves na região…</div>
      )}

      {error && (
        <div className="sidebar__state sidebar__state--error">{error}</div>
      )}

      {!loading && !error && nearest.length === 0 && (
        <div className="sidebar__state">Nenhuma aeronave encontrada nesta área do mapa.</div>
      )}

      <ul className="flight-list">
        {nearest.map((a) => (
          <li key={a.icao24} className="flight-card">
            <div className="flight-card__top">
              <span className="flight-card__callsign">{a.callsign}</span>
              <span
                className={`flight-card__status flight-card__status--${a.onGround ? "pousado" : "em-voo"}`}
              >
                {a.onGround ? "Em solo" : "Em voo"}
              </span>
            </div>
            <div className="flight-card__route">
              <span>{a.originCountry}</span>
              <span className="flight-card__route-line" />
              <span>{distanceKm(center, a).toFixed(0)} km</span>
            </div>
            <div className="flight-card__meta">
              <span>{a.icao24.toUpperCase()}</span>
              <span>{formatAltitude(a.altitude)}</span>
              <span>{formatSpeed(a.velocity)}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="sidebar__footer">
        <span className="sidebar__footer-dot" />
        {lastUpdated
          ? `OpenSky Network — atualizado às ${lastUpdated.toLocaleTimeString("pt-BR")}`
          : "OpenSky Network — aguardando dados"}
      </div>
    </aside>
  );
}
