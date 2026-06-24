import { fetchJSONWithCache } from '../utils/cache';

const COUNTRY_DEFAULT = "CL";

// Regiones de Chile para ayudar en la búsqueda
export const CHILE_REGIONS = [
  "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo",
  "Valparaíso", "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío",
  "La Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"
];

export interface LocationData {
  name: string;
  lat: number;
  lon: number;
  admin1?: string; // Región
  admin2?: string; // Comuna/Provincia
  population?: number;
}

export interface SearchResult extends LocationData {
  relevanceScore: number;
  type: 'city' | 'town' | 'village' | 'administrative';
}
export async function geocode(
  query: string,
  bust = false,
  signal?: AbortSignal
): Promise<LocationData> {
  const searchVariations = [
    query.trim(),
    query.replace(/región\s+/gi, '').trim(),
    query.replace(/\s+región$/gi, '').trim(),
    query.split(',')[0].trim(),
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  const results = await Promise.all(
    searchVariations.map(variation =>
      fetchJSONWithCache(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(variation)}&count=20&language=es&format=json`,
        86400 * 7, bust, { signal }
      ).catch(() => ({ json: null }))
    )
  );

  const allResults = results
    .flatMap(r => r.json?.results || [])
    .filter((x: any) => x.country_code === COUNTRY_DEFAULT);

  if (!allResults.length) {
    throw new Error(`No se encontró la localidad "${query}", ingrese la búsqueda nuevamente`);
  }

  const sorted = allResults.sort((a: any, b: any) => {
    const aScore = (a.population || 0) + (a.feature_code === 'PPLA' ? 100000 : 0);
    const bScore = (b.population || 0) + (b.feature_code === 'PPLA' ? 100000 : 0);
    return bScore - aScore;
  });

  const result = sorted[0];
  const name = [result.name, result.admin1, result.country].filter(Boolean).join(", ");

  return {
    name,
    lat: +result.latitude,
    lon: +result.longitude,
    admin1: result.admin1,
    admin2: result.admin2,
    population: result.population
  };
}

export async function searchLocations(
  query: string,
  bust = false,
  signal?: AbortSignal
): Promise<SearchResult[]> {
  if (query.length < 2) return [];

  const searchVariations = [
    query.trim(),
    query.replace(/región\s+/gi, '').trim(),
    query.replace(/\s+región$/gi, '').trim(),
    query.split(',')[0].trim()
  ].filter((v, i, arr) => arr.indexOf(v) === i && v.length >= 2);

  const results = await Promise.all(
    searchVariations.map(variation =>
      fetchJSONWithCache(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(variation)}&count=15&language=es&format=json`,
        86400 * 7, bust, { signal }
      ).catch(() => ({ json: null }))
    )
  );

  const allResults = results
    .flatMap(r => r.json?.results || [])
    .filter((x: any) => x.country_code === COUNTRY_DEFAULT);

  const uniqueResults = allResults.filter((result, index, arr) =>
    arr.findIndex(r => r.latitude === result.latitude && r.longitude === result.longitude) === index
  );

  const queryLower = query.toLowerCase();

  const processed = uniqueResults
    .map((result: any) => {
      const name = [result.name, result.admin1].filter(Boolean).join(", ");
      let relevanceScore = result.population || 0;

      if (result.feature_code === 'PPLA') relevanceScore += 100000;
      if (result.feature_code === 'PPLA2') relevanceScore += 50000;
      if (result.feature_code === 'PPL') relevanceScore += 10000;

      const nameLower = result.name.toLowerCase();
      if (nameLower === queryLower) relevanceScore += 50000;
      else if (nameLower.includes(queryLower)) relevanceScore += 25000;
      else if (queryLower.includes(nameLower)) relevanceScore += 15000;

      let type: 'city' | 'town' | 'village' | 'administrative' = 'village';
      if (result.population > 100000) type = 'city';
      else if (result.population > 10000) type = 'town';
      else if (result.feature_code?.includes('ADM')) type = 'administrative';

      return {
        name, lat: +result.latitude, lon: +result.longitude,
        admin1: result.admin1, admin2: result.admin2, population: result.population,
        relevanceScore, type
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 8);

  return processed;
}
export async function fetchForecast(
  lat: number,
  lon: number,
  bust = false,
  signal?: AbortSignal
) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "precipitation_probability",
      "uv_index",
      "wind_speed_10m"
    ].join(","),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "wind_speed_10m"
    ].join(","),
    past_days: "1",
    forecast_days: "5",
    daily: [
      "temperature_2m_min",
      "temperature_2m_max",
      "precipitation_sum",
      "precipitation_probability_max",
      "uv_index_max",
      "wind_speed_10m_max"
    ].join(","),
    timezone: "auto"
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  return await fetchJSONWithCache(url, 600, bust, { signal });
}

export async function fetchColdHoursHistory(
  lat: number,
  lon: number,
  startDate: string,
  bust = false,
  signal?: AbortSignal
) {
  const today = new Date().toLocaleDateString('en-CA');
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    start_date: startDate,
    end_date: today,
    hourly: 'temperature_2m',
    timezone: 'auto'
  });

  const url = `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`;
  return await fetchJSONWithCache(url, 3600, bust, { signal }); // 1h cache
}

export async function fetchObservations(
  lat: number,
  lon: number,
  bust = false,
  signal?: AbortSignal
) {
  const url = `https://api.open-meteo.com/v1/metar?latitude=${lat}&longitude=${lon}&count=1`;
  
  try {
    const { json } = await fetchJSONWithCache(url, 300, bust, { signal }); // 5 min cache
    return json?.data?.[0] || null;
  } catch {
    return null;
  }
}