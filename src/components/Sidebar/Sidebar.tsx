import "./Sidebar.css";

interface FlightMock {
  callsign: string;
  aircraft: string;
  origin: string;
  destination: string;
  altitude: string;
  speed: string;
  status: "em-voo" | "pousado" | "atrasado";
}

// Dados fictícios apenas para validar o layout — sem integração ainda.
const MOCK_FLIGHTS: FlightMock[] = [
  { callsign: "TAM3402", aircraft: "E195-E2", origin: "SBSP", destination: "SBRJ", altitude: "37.000 ft", speed: "452 kt", status: "em-voo" },
  { callsign: "AZU4108", aircraft: "E190", origin: "SBKP", destination: "SBCF", altitude: "34.500 ft", speed: "418 kt", status: "em-voo" },
  { callsign: "GLO1745", aircraft: "B737-800", origin: "SBGR", destination: "SBPA", altitude: "0 ft", speed: "0 kt", status: "pousado" },
  { callsign: "TAM8821", aircraft: "E175", origin: "SBBR", destination: "SBSV", altitude: "—", speed: "—", status: "atrasado" },
];

const STATUS_LABEL: Record<FlightMock["status"], string> = {
  "em-voo": "Em voo",
  pousado: "Pousado",
  atrasado: "Atrasado",
};

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <h2 className="sidebar__title">Voos monitorados</h2>
        <span className="sidebar__count">{MOCK_FLIGHTS.length}</span>
      </div>

      <ul className="flight-list">
        {MOCK_FLIGHTS.map((flight) => (
          <li key={flight.callsign} className="flight-card">
            <div className="flight-card__top">
              <span className="flight-card__callsign">{flight.callsign}</span>
              <span className={`flight-card__status flight-card__status--${flight.status}`}>
                {STATUS_LABEL[flight.status]}
              </span>
            </div>
            <div className="flight-card__route">
              <span>{flight.origin}</span>
              <span className="flight-card__route-line" />
              <span>{flight.destination}</span>
            </div>
            <div className="flight-card__meta">
              <span>{flight.aircraft}</span>
              <span>{flight.altitude}</span>
              <span>{flight.speed}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="sidebar__footer">
        <span className="sidebar__footer-dot" />
        Dados fictícios — integração com API ainda pendente
      </div>
    </aside>
  );
}
