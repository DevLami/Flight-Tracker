import "./Header.css";

function RadarMark() {
  return (
    <svg className="radar-mark" width="30" height="30" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke="var(--border-strong)" />
      <circle cx="16" cy="16" r="10" stroke="var(--border)" />
      <circle cx="16" cy="16" r="5" stroke="var(--border)" />
      <g className="radar-sweep">
        <path d="M16 16 L16 1 A15 15 0 0 1 29 8.5 Z" fill="var(--accent)" opacity="0.35" />
      </g>
      <circle cx="16" cy="16" r="1.6" fill="var(--accent)" />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="header">
      <div className="header__brand">
        <RadarMark />
        <div className="header__titles">
          <span className="header__eyebrow">EMBRAER // ATC CONSOLE</span>
          <h1 className="header__title">FLIGHT TRACKER</h1>
        </div>
      </div>

      <div className="header__status">
        <div className="status-item">
          <span className="status-dot status-dot--live" />
          <span>AO VIVO</span>
        </div>
        <div className="status-item status-item--mono">
          <span className="header__divider" />
          <span>SETOR: SBSP</span>
        </div>
        <div className="status-item status-item--mono">
          <span className="header__divider" />
          <span>V0.1.0</span>
        </div>
      </div>
    </header>
  );
}
