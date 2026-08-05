import "./App.css";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import MapView from "../components/MapView/MapView";

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <MapView />
      <Sidebar />
    </div>
  );
}
