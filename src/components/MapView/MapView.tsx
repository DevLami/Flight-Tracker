import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap, useMapEvent } from "react-leaflet";
import type { LatLng, LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";
import SearchBar from "../SearchBar/SearchBar";
import AircraftMarker from "./AircraftMarker";
import type { Aircraft, BoundingBox } from "../../types/opensky";
import { distanceKm, getRenderPositions, normalizeLon } from "../../utils/geo";

// Centro inicial: espaço aéreo sobre São José dos Campos (sede da Embraer)
const INITIAL_CENTER: [number, number] = [-23.2237, -45.9009];
const INITIAL_ZOOM = 7;

// Com o mapa bem afastado, a bbox pode cobrir uma área enorme e trazer
// centenas de aviões — isso deixa a página inteira travada (marcadores
// demais no DOM). Por isso limitamos quantos são desenhados de uma vez,
// priorizando os mais próximos do centro do mapa.
const MAX_MARKERS = 150;

// O mapa pode ser arrastado continuamente (o mundo "repete" nas bordas),
// então normalizamos a longitude pro intervalo padrão -180..180 antes de
// consultar a OpenSky. Se isso fizer lonMin ficar maior que lonMax, é
// porque a área visível cruza o antimeridiano (±180°) — fetchAircraftInBounds
// trata esse caso dividindo a busca em duas.
function boundsToBbox(bounds: LatLngBounds): BoundingBox {
  return {
    latMin: bounds.getSouth(),
    latMax: bounds.getNorth(),
    lonMin: normalizeLon(bounds.getWest()),
    lonMax: normalizeLon(bounds.getEast()),
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
  isMock: boolean;
  onCenterChange: (center: { lat: number; lng: number }) => void;
  onBoundsChange: (bbox: BoundingBox) => void;
}

export default function MapView({
  center,
  aircraft,
  loading,
  error,
  lastUpdated,
  isMock,
  onCenterChange,
  onBoundsChange,
}: MapViewProps) {
  // Só reordena/corta a lista quando ela realmente muda — evita recalcular
  // a cada re-render (ex.: quando só o "loading" pisca).
  const { visibleAircraft, isCapped } = useMemo(() => {
    if (aircraft.length <= MAX_MARKERS) {
      return { visibleAircraft: aircraft, isCapped: false };
    }
    const nearest = [...aircraft]
      .sort((a, b) => distanceKm(center, a) - distanceKm(center, b))
      .slice(0, MAX_MARKERS);
    return { visibleAircraft: nearest, isCapped: true };
  }, [aircraft, center]);

  return (
    <div className="map-view">
      <SearchBar />

      <MapContainer
        center={INITIAL_CENTER}
        zoom={INITIAL_ZOOM}
        minZoom={3}
        zoomControl={false}
        className="map-view__container"
        worldCopyJump
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

        {visibleAircraft.map((a) =>
          getRenderPositions(a.latitude, a.longitude).map((pos, i) => (
            <AircraftMarker key={i === 0 ? a.icao24 : `${a.icao24}-shadow`} aircraft={a} position={pos} />
          ))
        )}
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
        <span>
          {isCapped ? `${visibleAircraft.length} DE ${aircraft.length}` : aircraft.length} AERONAVES
        </span>
      </div>

      <div className="map-status">
        {isMock && (
          <span className="map-status__badge map-status__badge--mock">Modo demonstração — sem conexão com a OpenSky</span>
        )}
        {!isMock && isCapped && (
          <span className="map-status__badge map-status__badge--mock">
            Exibindo as {MAX_MARKERS} mais próximas — aproxime para ver as demais
          </span>
        )}
        {!isMock && !isCapped && loading && <span className="map-status__badge map-status__badge--loading">Atualizando…</span>}
        {!isMock && !isCapped && error && <span className="map-status__badge map-status__badge--error">{error}</span>}
        {!isMock && !isCapped && !loading && !error && lastUpdated && (
          <span className="map-status__badge">
            Atualizado às {lastUpdated.toLocaleTimeString("pt-BR")}
          </span>
        )}
      </div>
    </div>
  );
}
