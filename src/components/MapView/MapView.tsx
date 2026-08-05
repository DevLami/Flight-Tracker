import { useEffect } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap, useMapEvent } from "react-leaflet";
import type { LatLng, LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";
import SearchBar from "../SearchBar/SearchBar";
import AircraftMarker from "./AircraftMarker";
import type { Aircraft, BoundingBox } from "../../types/opensky";

// Centro inicial: espaço aéreo sobre São José dos Campos (sede da Embraer)
const INITIAL_CENTER: [number, number] = [-23.2237, -45.9009];
const INITIAL_ZOOM = 7;

function boundsToBbox(bounds: LatLngBounds): BoundingBox {
  return {
    latMin: bounds.getSouth(),
    latMax: bounds.getNorth(),
    lonMin: bounds.getWest(),
    lonMax: bounds.getEast(),
  };
}

function MapTracker({
  onMove,
  onBounds,
}: {
  onMove: (center: LatLng) => void;
  onBounds: (bbox: BoundingBox) => void;
}) {
  const map = useMapEvent("moveend", () => {
    onMove(map.getCenter());
    onBounds(boundsToBbox(map.getBounds()));
  });
  return null;
}

// Captura o bounding box inicial assim que o mapa é montado
// (o evento "moveend" só dispara em movimentos subsequentes).
function InitialBounds({ onBounds }: { onBounds: (bbox: BoundingBox) => void }) {
  const map = useMap();
  useEffect(() => {
    onBounds(boundsToBbox(map.getBounds()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

interface MapViewProps {
  center: { lat: number; lng: number };
  aircraft: Aircraft[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  onCenterChange: (center: { lat: number; lng: number }) => void;
  onBoundsChange: (bbox: BoundingBox) => void;
}

export default function MapView({
  center,
  aircraft,
  loading,
  error,
  lastUpdated,
  onCenterChange,
  onBoundsChange,
}: MapViewProps) {
  return (
    <div className="map-view">
      <SearchBar />

      <MapContainer
        center={INITIAL_CENTER}
        zoom={INITIAL_ZOOM}
        minZoom={3}
        zoomControl={false}
        className="map-view__container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="bottomright" />
        <InitialBounds onBounds={onBoundsChange} />
        <MapTracker
          onMove={(c) => onCenterChange({ lat: c.lat, lng: c.lng })}
          onBounds={onBoundsChange}
        />

        {aircraft.map((a) => (
          <AircraftMarker key={a.icao24} aircraft={a} />
        ))}
      </MapContainer>

      <div className="map-hud">
        <span className="map-hud__corner map-hud__corner--tl" />
        <span className="map-hud__corner map-hud__corner--tr" />
        <span className="map-hud__corner map-hud__corner--bl" />
        <span className="map-hud__corner map-hud__corner--br" />
      </div>

      <div className="map-readout">
        <span>LAT {center.lat.toFixed(4)}</span>
        <span className="map-readout__sep" />
        <span>LON {center.lng.toFixed(4)}</span>
        <span className="map-readout__sep" />
        <span>{aircraft.length} AERONAVES</span>
      </div>

      <div className="map-status">
        {loading && <span className="map-status__badge map-status__badge--loading">Atualizando…</span>}
        {error && <span className="map-status__badge map-status__badge--error">{error}</span>}
        {!loading && !error && lastUpdated && (
          <span className="map-status__badge">
            Atualizado às {lastUpdated.toLocaleTimeString("pt-BR")}
          </span>
        )}
      </div>
    </div>
  );
}
