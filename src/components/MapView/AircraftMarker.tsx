import { memo } from "react";
import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import type { Aircraft } from "../../types/opensky";

function createPlaneIcon(heading: number, onGround: boolean) {
  const color = onGround ? "#55677a" : "#00e39c";
  return divIcon({
    className: "aircraft-icon",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `
      <svg width="22" height="22" viewBox="0 0 24 24" style="transform: rotate(${heading}deg)">
        <path d="M12 2 L15 11 L22 14 L22 16 L15 14.5 L14 20 L17 22 L17 23 L12 21.5 L7 23 L7 22 L10 20 L9 14.5 L2 16 L2 14 L9 11 Z"
          fill="${color}" stroke="#0a0e14" stroke-width="0.6"/>
      </svg>
    `,
  });
}

function formatAltitude(meters: number | null) {
  if (meters === null) return "—";
  const feet = Math.round(meters * 3.28084);
  return `${feet.toLocaleString("pt-BR")} ft`;
}

function formatSpeed(mps: number | null) {
  if (mps === null) return "—";
  const knots = Math.round(mps * 1.94384);
  return `${knots} kt`;
}

function AircraftMarker({ aircraft, position }: { aircraft: Aircraft; position: [number, number] }) {
  return (
    <Marker
      position={position}
      icon={createPlaneIcon(aircraft.heading ?? 0, aircraft.onGround)}
    >
      <Popup>
        <div className="aircraft-popup">
          <strong>{aircraft.callsign}</strong>
          <span>{aircraft.originCountry}</span>
          <span>Altitude: {formatAltitude(aircraft.altitude)}</span>
          <span>Velocidade: {formatSpeed(aircraft.velocity)}</span>
          <span>ICAO24: {aircraft.icao24}</span>
        </div>
      </Popup>
    </Marker>
  );
}

// memo evita re-renderizar (e recriar o ícone SVG) de marcadores cujos
// dados não mudaram entre uma atualização e outra da lista de aviões.
export default memo(AircraftMarker, (prev, next) => {
  const a = prev.aircraft;
  const b = next.aircraft;
  return (
    a.icao24 === b.icao24 &&
    a.latitude === b.latitude &&
    a.longitude === b.longitude &&
    a.heading === b.heading &&
    a.altitude === b.altitude &&
    a.velocity === b.velocity &&
    a.onGround === b.onGround &&
    prev.position[0] === next.position[0] &&
    prev.position[1] === next.position[1]
  );
});
