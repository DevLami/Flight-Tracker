import { useState } from "react";
import { MapContainer, TileLayer, ZoomControl, useMapEvent } from "react-leaflet";
import type { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";
import SearchBar from "../SearchBar/SearchBar";

// Centro inicial: espaço aéreo sobre São José dos Campos (sede da Embraer)
const INITIAL_CENTER: [number, number] = [-23.2237, -45.9009];
const INITIAL_ZOOM = 7;

function CenterTracker({ onMove }: { onMove: (center: LatLng) => void }) {
  useMapEvent("moveend", (e) => {
    onMove(e.target.getCenter());
  });
  return null;
}

export default function MapView() {
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: INITIAL_CENTER[0],
    lng: INITIAL_CENTER[1],
  });

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
        <CenterTracker onMove={(c) => setCenter({ lat: c.lat, lng: c.lng })} />
      </MapContainer>

      {/* Molduras HUD nos cantos — apenas visual, não interceptam clique */}
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
      </div>
    </div>
  );
}
