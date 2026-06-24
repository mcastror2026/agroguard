import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, AlertTriangle, Snowflake, CloudRain } from 'lucide-react';

type Tab = 'resumen' | 'heladas' | 'clima';

import { SearchBar } from './components/SearchBar';
import { RiskIndicator } from './components/RiskIndicator';
import { TodaySummary } from './components/TodaySummary';
import { FrostForecast } from './components/FrostForecast';
import { WeatherForecast } from './components/WeatherForecast';
import { SkeletonRiskIndicator, SkeletonTodaySummary, SkeletonFrostForecast, SkeletonWeatherForecast } from './components/SkeletonLoader';

import { geocode, fetchForecast, fetchObservations, searchLocations, LocationData, SearchResult } from './services/weatherAPI';
import { frostCategory, fungalRisk, uvCategory } from './utils/riskCalculations';
import { getRecentSearches, addRecentSearch, clearRecentSearches, RecentSearch } from './utils/recentSearches';

export default function App() {
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [meteo, setMeteo] = useState<any>(null);
  const [obs, setObs] = useState<any>(null);
  const [focusNight, setFocusNight] = useState(false);
  const [servedFromCache, setServedFromCache] = useState(false);
  const lastController = useRef<AbortController | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('resumen');

  // Load recent searches
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);


  // Búsqueda de sugerencias con debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchLocations(query.trim());
          setSearchResults(results);
        } catch (error) {
          console.warn('Error buscando sugerencias:', error);
          setSearchResults([]);
        }
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Search location function
  async function searchLocation(forceRefresh = false) {
    if (lastController.current) {
      try {
        lastController.current.abort();
      } catch {}
    }

    const controller = new AbortController();
    lastController.current = controller;

    try {
      setError("");
      setLoading(true);
      setPlace(null);
      setMeteo(null);
      setObs(null);
      setShowSuggestions(false);

      const location = await geocode(query, forceRefresh, controller.signal);
      setPlace(location);

      const [{ json: meteorological, fromCache }, observations] = await Promise.all([
        fetchForecast(location.lat, location.lon, forceRefresh, controller.signal),
        fetchObservations(location.lat, location.lon, forceRefresh, controller.signal)
      ]);

      setServedFromCache(fromCache === true);
      setMeteo(meteorological);
      setObs(observations);

      // Add to recent searches
      addRecentSearch({
        name: location.name
      });
      setRecentSearches(getRecentSearches());
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      
      // Mensajes de error más amigables
      let errorMessage = "Error buscando ubicación";
      if (e?.message) {
        errorMessage = e.message;
      } else if (e?.name === "NetworkError" || e?.message?.includes("fetch")) {
        errorMessage = "Error de conexión. Verifica tu internet e intenta nuevamente.";
      } else if (e?.message?.includes("not found")) {
        errorMessage = `No se encontraron datos para "${query}". Intenta con una ciudad más grande como Santiago, Valparaíso o Concepción.`;
      }
      
      setError(errorMessage);
      setMeteo(null);
      setObs(null);
    } finally {
      setLoading(false);
    }
  }

  // Seleccionar ubicación desde sugerencias
  function selectLocation(location: SearchResult) {
    setQuery(location.name);
    setShowSuggestions(false);
    setPlace(location);

    // Buscar datos meteorológicos para la ubicación seleccionada
    setTimeout(() => searchLocation(false), 100);
  }

  // Select recent search
  function selectRecentSearch(search: RecentSearch) {
    setQuery(search.name);
    setTimeout(() => searchLocation(false), 100);
  }

  // Clear recent searches
  function handleClearRecent() {
    clearRecentSearches();
    setRecentSearches([]);
  }

  // Use geolocation to get current position
  async function useGeolocation() {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // Create location object from coordinates
      const location: LocationData = {
        lat: latitude,
        lon: longitude,
        name: `Mi ubicación (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`,
        country: 'CL'
      };

      setPlace(location);
      setQuery("");

      // Fetch weather data for this location
      const [{ json: meteorological, fromCache }, observations] = await Promise.all([
        fetchForecast(latitude, longitude, false),
        fetchObservations(latitude, longitude, false)
      ]);

      setServedFromCache(fromCache === true);
      setMeteo(meteorological);
      setObs(observations);
    } catch (error: any) {
      if (error.code === 1) {
        setError("Permiso de ubicación denegado. Habilita el acceso a tu ubicación en la configuración del navegador.");
      } else if (error.code === 2) {
        setError("No se pudo determinar tu ubicación. Verifica que tengas GPS activado.");
      } else if (error.code === 3) {
        setError("Tiempo de espera agotado al obtener ubicación. Intenta nuevamente.");
      } else {
        setError("Error obteniendo tu ubicación. Intenta con búsqueda manual.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Clear all data
  function clearData() {
    setPlace(null);
    setMeteo(null);
    setObs(null);
    setError("");
    setSearchResults([]);
    setShowSuggestions(false);
  }

  // Save last query to localStorage
  useEffect(() => {
    if (place?.name) {
      localStorage.setItem("agroguard:lastQuery", place.name);
    }
  }, [place?.name]);

  // Calculate next 48 hours data
  const next48h = useMemo(() => {
    if (!meteo?.hourly) return [];
    
    const { time, temperature_2m, relative_humidity_2m, precipitation, precipitation_probability, uv_index } = meteo.hourly;
    const now = Date.now();
    
    return time.map((t: string, i: number) => ({
      t,
      temp: temperature_2m?.[i],
      rh: relative_humidity_2m?.[i],
      rain: precipitation?.[i],
      ppop: precipitation_probability?.[i],
      uv: uv_index?.[i]
    })).filter((h: any) => {
      const ts = new Date(h.t).getTime();
      return ts >= now && ts <= now + 48 * 3600 * 1000;
    });
  }, [meteo]);

  // Calculate fungal risk
  const fungalRiskData = useMemo(() => fungalRisk(next48h), [next48h]);

  // Calculate next 24 hours data and rain accumulation
  const next24h = useMemo(() => 
    next48h.filter(h => new Date(h.t).getTime() <= Date.now() + 24 * 3600 * 1000), 
    [next48h]
  );
  
  const rain24mm = useMemo(() => 
    next24h.reduce((sum, h) => sum + (typeof h.rain === 'number' ? h.rain : 0), 0), 
    [next24h]
  );

  // Calculate daily weather data
  const dailyRain = useMemo(() => {
    if (!meteo?.daily) return [];
    
    const n = meteo.daily.time.length;
    const today = new Date().toLocaleDateString('en-CA');
    const rows = [];
    
    for (let i = 0; i < n; i++) {
      if (meteo.daily.time[i] < today) continue;
      
      rows.push({
        date: meteo.daily.time[i],
        pop: meteo.daily.precipitation_probability_max?.[i] ?? null,
        sum: meteo.daily.precipitation_sum?.[i] ?? null,
        tmin: meteo.daily.temperature_2m_min?.[i] ?? null,
        tmax: meteo.daily.temperature_2m_max?.[i] ?? null,
        uvmax: meteo.daily.uv_index_max?.[i] ?? null,
      });
    }
    
    return rows.slice(0, 5);
  }, [meteo]);

  // Calculate current UV
  const uvNow = useMemo(() => {
    if (!meteo?.hourly?.time?.length) return null;
    
    const { time, uv_index } = meteo.hourly;
    let best = null;
    let bestDiff = Infinity;
    
    for (let i = 0; i < time.length; i++) {
      const ts = new Date(time[i]).getTime();
      const diff = Math.abs(ts - Date.now());
      
      if (diff < bestDiff && typeof uv_index?.[i] === 'number') {
        best = uv_index[i];
        bestDiff = diff;
      }
    }
    
    return best;
  }, [meteo]);

  // Calculate frost bands
  const frostBands = useMemo(() => {
    if (!meteo?.hourly?.time?.length) return [];
    
    const { time, temperature_2m } = meteo.hourly;
    const now = Date.now();
    const end = now + 48 * 3600 * 1000;
    
    const isNight = (ts: number) => {
      const h = new Date(ts).getHours();
      return h >= 18 || h < 8;
    };
    
    const hours = [];
    for (let i = 0; i < time.length; i++) {
      const ts = new Date(time[i]).getTime();
      if (ts >= now && ts <= end) {
        const t = temperature_2m?.[i];
        if (typeof t === 'number') {
          // Si focusNight está activado, solo incluir horas nocturnas
          if (!focusNight || isNight(ts)) {
            hours.push({ ts, temp: t });
          }
        }
      }
    }
    
    if (!hours.length) return [];
    
    // Cambiar a bandas de 4 horas para tener más datos
    const bandMs = 4 * 3600 * 1000; // 4 hours
    const start0 = now;
    const out = [];
    
    // Crear más bandas (12 bandas de 4 horas = 48 horas)
    for (let b = 0; b < 12; b++) {
      const bStart = start0 + b * bandMs;
      const bEnd = bStart + bandMs;
      const inBand = hours.filter(h => h.ts >= bStart && h.ts < bEnd);
      
      if (!inBand.length) continue;
      
      const tmin = inBand.reduce((m, h) => Math.min(m, h.temp), Infinity);
      const cat = frostCategory(tmin);
      
      out.push({
        start: new Date(bStart),
        end: new Date(bEnd),
        tmin,
        ...cat
      });
    }
    
    return out;
  }, [meteo, focusNight]);

  // Calculate frost risk for next night
  const frostNextNight = useMemo(() => {
    if (!meteo?.hourly?.time?.length) return frostCategory(null);
    
    const { time, temperature_2m } = meteo.hourly;
    const now = Date.now();
    const targetHours = new Set([18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7]);
    
    let min = Infinity;
    let found = false;
    
    for (let i = 0; i < time.length; i++) {
      const d = new Date(time[i]);
      const ts = d.getTime();
      
      if (ts < now) continue;
      if (ts > now + 18 * 3600 * 1000) break;
      
      const h = d.getHours();
      if (targetHours.has(h)) {
        const v = temperature_2m?.[i];
        if (typeof v === 'number') {
          min = Math.min(min, v);
          found = true;
        }
      }
    }
    
    return frostCategory(found ? min : null);
  }, [meteo]);

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Leaf className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
            <h1 className="text-3xl md:text-5xl font-light tracking-tight text-gray-900">
              AgroGuard
            </h1>
          </div>
          <p className="mt-1 text-sm md:text-base text-gray-500 font-light max-w-2xl mx-auto">
            Sistema de alertas agrícolas para Chile
          </p>
        </motion.header>

        {/* Search Bar */}
        <SearchBar
          query={query}
          loading={loading}
          searchResults={searchResults}
          showSuggestions={showSuggestions}
          recentSearches={recentSearches}
          onQueryChange={setQuery}
          onSearch={() => searchLocation(false)}
          onRefresh={() => searchLocation(true)}
          onClear={clearData}
          onSelectLocation={selectLocation}
          onFocusSearch={() => setShowSuggestions(true)}
          onBlurSearch={() => setTimeout(() => setShowSuggestions(false), 200)}
          onUseGeolocation={useGeolocation}
          onSelectRecent={selectRecentSearch}
          onClearRecent={handleClearRecent}
        />

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200/50 rounded-2xl text-red-700 text-center flex items-center justify-center gap-2"
            role="alert"
          >
            <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
            <span className="font-light">{error}</span>
          </motion.div>
        )}

        {/* Location and Cache Info */}
        {place && (
          <div className="mb-8 text-center">
            <div className="inline-block bg-gray-50 px-6 py-4 rounded-2xl border border-gray-200/50">
              <div className="text-lg font-light text-gray-900">
                📍 {place.name}
                {place.population && (
                  <span className="ml-2 text-xs text-gray-400 font-light">
                    ({place.population > 1000000 ? `${(place.population / 1000000).toFixed(1)}M` :
                      place.population > 1000 ? `${Math.round(place.population / 1000)}k` :
                      place.population} hab.)
                  </span>
                )}
              </div>
              {meteo && (
                <div className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-3 font-light">
                  <span>
                    {servedFromCache
                      ? "⚡ Caché"
                      : "🌐 Actualizado"
                    }
                  </span>
                  {meteo.timezone && (
                    <span>🕒 {meteo.timezone}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && !meteo && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <SkeletonRiskIndicator />
              <SkeletonRiskIndicator />
              <SkeletonRiskIndicator />
            </div>
            <SkeletonTodaySummary />
            <SkeletonFrostForecast />
            <SkeletonWeatherForecast />
          </>
        )}

        {/* Weather Data Display */}
        {meteo && !loading && (
          <>
            {/* Tab Bar */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-2xl">
              {([
                { key: 'resumen', label: 'Resumen', icon: AlertTriangle },
                { key: 'heladas', label: 'Heladas', icon: Snowflake },
                { key: 'clima',   label: 'Clima', icon: CloudRain },
              ] as { key: Tab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-light transition-all duration-200 ${
                    activeTab === key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'resumen' && (
                <motion.div
                  key="resumen"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-2xl md:text-3xl font-light tracking-tight text-gray-900 mb-6 flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-500" strokeWidth={1.5} />
                    Alertas de Riesgo
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4 md:gap-5 mb-10">
                    <RiskIndicator
                      title="Riesgo de Heladas (próx. noche)"
                      tooltipText="Indica la probabilidad de que las temperaturas desciendan por debajo de 0°C durante la noche, lo que puede dañar cultivos sensibles."
                      {...frostNextNight}
                      severity={frostNextNight.severity}
                    />
                    <RiskIndicator
                      title="Riesgo de Hongos (próx. 48h)"
                      tooltipText="Calcula el riesgo de desarrollo de enfermedades fúngicas basándose en la humedad y temperatura. Alta humedad + temperaturas moderadas = mayor riesgo."
                      {...fungalRiskData}
                      severity={fungalRiskData.severity}
                    />
                    {(() => {
                      const dailyMaxUV = meteo?.daily?.uv_index_max?.[0];
                      const month = new Date().getMonth() + 1;
                      if (dailyMaxUV == null) return null;
                      const uvCat = uvCategory(dailyMaxUV, month);
                      return (
                        <RiskIndicator
                          title="Índice UV (máximo hoy)"
                          tooltipText="Mide la intensidad de la radiación ultravioleta del sol. Valores altos requieren protección para trabajadores agrícolas y pueden afectar algunos cultivos."
                          {...uvCat}
                          severity={uvCat.severity}
                        />
                      );
                    })()}
                  </div>
                  <TodaySummary meteo={meteo} obs={obs} uvNow={uvNow} />
                </motion.div>
              )}

              {activeTab === 'heladas' && (
                <motion.div
                  key="heladas"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-end mb-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200/50 hover:bg-gray-100 transition-all">
                      <input
                        type="checkbox"
                        checked={focusNight}
                        onChange={e => setFocusNight(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700 font-light">Solo período nocturno (18:00–08:00)</span>
                    </label>
                  </div>
                  <FrostForecast frostBands={frostBands} focusNight={focusNight} />
                </motion.div>
              )}

              {activeTab === 'clima' && (
                <motion.div
                  key="clima"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <WeatherForecast dailyRain={dailyRain} rain24mm={rain24mm} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Footer con información del desarrollador */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center pb-8"
        >
          <div className="border-t border-gray-200/50 pt-8 space-y-3">
            <p className="text-sm text-gray-500 font-light">
              Desarrollado por <span className="font-normal text-emerald-600">MC</span> • Versión 1.0
            </p>
            <p className="text-xs text-gray-400 font-light max-w-xl mx-auto leading-relaxed">
              ⚠️ La información meteorológica proviene de modelos globales (Open-Meteo) y tiene carácter referencial.
              No reemplaza la observación local ni el asesoramiento de un profesional agrícola.
              Verifique siempre con estaciones meteorológicas cercanas antes de tomar decisiones productivas.
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}