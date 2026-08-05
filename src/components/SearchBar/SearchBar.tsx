import { useState, type FormEvent } from "react";
import "./SearchBar.css";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: integrar busca de voos (callsign, ICAO24, número do voo, aeroporto)
    console.log("Buscar voo:", query);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <svg className="search-bar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        className="search-bar__input"
        placeholder="Buscar voo, callsign ou aeroporto..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <span className="search-bar__hint">ICAO24 / CALLSIGN</span>
    </form>
  );
}
