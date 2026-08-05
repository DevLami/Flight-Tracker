// Formato bruto de cada state vector retornado pela OpenSky Network.
// Documentação: https://openskynetwork.github.io/opensky-api/rest.html
// Cada avião vem como um array posicional — por isso o índice de cada campo importa.
export type OpenSkyStateVectorRaw = [
  icao24: string,
  callsign: string | null,
  originCountry: string,
  timePosition: number | null,
  lastContact: number,
  longitude: number | null,
  latitude: number | null,
  baroAltitude: number | null,
  onGround: boolean,
  velocity: number | null,
  trueTrack: number | null,
  verticalRate: number | null,
  sensors: number[] | null,
  geoAltitude: number | null,
  squawk: string | null,
  spi: boolean,
  positionSource: number
];

export interface OpenSkyStatesResponse {
  time: number;
  states: OpenSkyStateVectorRaw[] | null;
}

// Formato normalizado, mais fácil de usar nos componentes.
export interface Aircraft {
  icao24: string;
  callsign: string;
  originCountry: string;
  latitude: number;
  longitude: number;
  altitude: number | null; // metros
  velocity: number | null; // m/s
  heading: number | null; // graus, 0 = norte
  verticalRate: number | null;
  onGround: boolean;
}

export interface BoundingBox {
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
}
