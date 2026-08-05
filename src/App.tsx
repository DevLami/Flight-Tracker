import { useState } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import MapView from "./components/MapView/MapView";
import { useAircraft } from "./hooks/useAircraft";
import type { BoundingBox } from "./types/opensky";

// Centro inicial: espaço aéreo sobre São José dos Campos (sede da Embraer)
const INITIAL_CENTER = { lat: -23.2237, lng: -45.9009 };

export default function App() {
  const [center, setCenter] = useState(INITIAL_CENTER);
  const [bbox, setBbox] = useState<BoundingBox | null>(null);

  const { aircraft, loading, error, lastUpdated } = useAircraft(bbox);

  return (
    <div className="app-shell">
      <Header />
      <MapView
        center={center}
        aircraft={aircraft}
        loading={loading}
        error={error}
        lastUpdated={lastUpdated}
        onCenterChange={setCenter}
        onBoundsChange={setBbox}
      />
      <Sidebar
        aircraft={aircraft}
        center={center}
        loading={loading}
        error={error}
        lastUpdated={lastUpdated}
      />
    </div>
  );
}
