export interface Airport {
  icao: string;
  name: string;
  lat: number;
  lon: number;
}

export const CHILE_AIRPORTS: Airport[] = [
  { icao: 'SCEL', name: 'Santiago (AMB)',     lat: -33.393, lon: -70.786 },
  { icao: 'SCRG', name: 'Rancagua',           lat: -34.173, lon: -70.776 },
  { icao: 'SCQP', name: 'Curicó',             lat: -34.962, lon: -71.228 },
  { icao: 'SCCH', name: 'Chillán',            lat: -36.583, lon: -72.031 },
  { icao: 'SCTC', name: 'Temuco',             lat: -38.766, lon: -72.637 },
  { icao: 'SCVD', name: 'Valdivia',           lat: -39.650, lon: -73.086 },
  { icao: 'SCTE', name: 'Puerto Montt',       lat: -41.439, lon: -73.094 },
  { icao: 'SCSE', name: 'La Serena',          lat: -29.916, lon: -71.200 },
  { icao: 'SCFA', name: 'Antofagasta',        lat: -23.444, lon: -70.445 },
  { icao: 'SCIP', name: 'Isla de Pascua',     lat: -27.165, lon: -109.422 },
  { icao: 'SCPQ', name: 'Concepción',         lat: -36.982, lon: -73.061 },
  { icao: 'SCQF', name: 'Chaitén',            lat: -42.929, lon: -72.699 },
  { icao: 'SCPU', name: 'Puerto Natales',     lat: -51.673, lon: -72.528 },
  { icao: 'SCPN', name: 'Punta Arenas',       lat: -53.002, lon: -70.855 },
  { icao: 'SCBA', name: 'Balmaceda (Aysén)',  lat: -45.916, lon: -71.689 },
  { icao: 'SCCA', name: 'Calama',             lat: -22.498, lon: -68.904 },
  { icao: 'SCDA', name: 'Iquique',            lat: -20.535, lon: -70.181 },
  { icao: 'SCAR', name: 'Arica',              lat: -18.349, lon: -70.339 },
  { icao: 'SCVP', name: 'Valparaíso (Rodelillo)', lat: -33.054, lon: -71.559 },
  { icao: 'SCOS', name: 'Osorno',             lat: -40.611, lon: -73.061 },
];

function toRad(deg: number) {
  return deg * (Math.PI / 180);
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestAirport(lat: number, lon: number, maxKm = 150): (Airport & { distanceKm: number }) | null {
  let nearest: (Airport & { distanceKm: number }) | null = null;

  for (const airport of CHILE_AIRPORTS) {
    const dist = distanceKm(lat, lon, airport.lat, airport.lon);
    if (dist <= maxKm && (!nearest || dist < nearest.distanceKm)) {
      nearest = { ...airport, distanceKm: Math.round(dist) };
    }
  }

  return nearest;
}
