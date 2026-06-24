import React from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, Trash2, MapPin, Users, Navigation, Clock, X } from 'lucide-react';
import { SearchResult } from '../services/weatherAPI';
import { RecentSearch } from '../utils/recentSearches';

interface SearchBarProps {
  query: string;
  loading: boolean;
  searchResults: SearchResult[];
  showSuggestions: boolean;
  recentSearches: RecentSearch[];
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onRefresh: () => void;
  onClear: () => void;
  onSelectLocation: (location: SearchResult) => void;
  onFocusSearch: () => void;
  onBlurSearch: () => void;
  onUseGeolocation?: () => void;
  onSelectRecent: (search: RecentSearch) => void;
  onClearRecent: () => void;
}

export function SearchBar({
  query,
  loading,
  searchResults,
  showSuggestions,
  recentSearches,
  onQueryChange,
  onSearch,
  onRefresh,
  onClear,
  onSelectLocation,
  onFocusSearch,
  onBlurSearch,
  onUseGeolocation,
  onSelectRecent,
  onClearRecent
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      onSearch();
    }
  };

  const formatPopulation = (pop: number | undefined) => {
    if (!pop) return '';
    if (pop > 1000000) return `${(pop / 1000000).toFixed(1)}M hab.`;
    if (pop > 1000) return `${(pop / 1000).toFixed(0)}k hab.`;
    return `${pop} hab.`;
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'city': return '🏙️';
      case 'town': return '🏘️';
      case 'village': return '🏡';
      case 'administrative': return '🏛️';
      default: return '📍';
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="bg-white rounded-2xl border border-gray-200/50 p-6 mb-8"
    >
      {/* Información sobre la búsqueda */}
      <div className="mb-5 p-4 bg-emerald-50/30 rounded-2xl text-sm text-gray-700 border border-emerald-200/50">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
          <span className="font-light">Búsqueda inteligente para Chile</span>
        </div>
        <div className="text-xs text-gray-500 font-light">
          Busca por ciudad, comuna o región. Si no encuentra tu ubicación exacta, mostrará la más cercana disponible.
          <br />
          <span className="font-normal">Ejemplos:</span> "Santiago", "Valparaíso", "Temuco", "Metropolitana", "Antofagasta"
        </div>
      </div>

      {/* Fila 1: input + botón geolocalización */}
      <div className="flex gap-2 items-center mb-3">
        {onUseGeolocation && (
          <button
            onClick={onUseGeolocation}
            disabled={loading}
            className="h-12 px-4 rounded-2xl bg-blue-500 text-white font-light shadow-sm hover:shadow-md hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
            title="Usar mi ubicación"
          >
            <Navigation className="w-5 h-5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Mi Ubicación</span>
          </button>
        )}

        <div className="relative flex-1" onBlur={onBlurSearch}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" strokeWidth={1.5} />
          <input
            className="w-full pl-10 pr-4 py-3 text-lg rounded-2xl border border-gray-200/50 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 font-light"
            placeholder="🌎 Buscar ciudad, comuna o región en Chile..."
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocusSearch}
            disabled={loading}
            aria-label="Buscar ubicación en Chile"
          />
          
          {/* Sugerencias de búsqueda */}
          {showSuggestions && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200/50 rounded-2xl shadow-lg z-50 max-h-80 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100/50 last:border-b-0 transition-colors font-light"
                  onClick={() => onSelectLocation(result)}
                  onMouseDown={(e) => e.preventDefault()} // Prevenir blur del input
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getLocationIcon(result.type)}</span>
                      <div>
                        <div className="font-light text-gray-900">{result.name}</div>
                        {result.admin2 && (
                          <div className="text-xs text-gray-400 font-light">
                            {result.admin2}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {result.population && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-light">
                          <Users className="w-3 h-3" strokeWidth={1.5} />
                          {formatPopulation(result.population)}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 capitalize font-light">
                        {result.type === 'city' ? 'Ciudad' :
                         result.type === 'town' ? 'Comuna' :
                         result.type === 'village' ? 'Localidad' : 'Administrativa'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fila 2: botones de acción */}
      <div className="flex gap-2">
        <button
          onClick={onSearch}
          disabled={loading || !query.trim()}
          className="flex-1 h-11 rounded-2xl bg-emerald-500 text-white font-light shadow-sm hover:shadow-md hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" strokeWidth={1.5} />
          Buscar
        </button>

        <button
          onClick={onRefresh}
          disabled={loading || !query.trim()}
          className="flex-1 h-11 rounded-2xl bg-amber-500 text-white font-light shadow-sm hover:shadow-md hover:bg-amber-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          Actualizar
        </button>

        <button
          onClick={onClear}
          disabled={loading}
          className="h-11 px-4 rounded-2xl border border-gray-200/50 bg-white text-gray-700 font-light shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">Limpiar</span>
        </button>
      </div>
      
      {/* Búsquedas recientes */}
      {recentSearches.length > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-light">
              <Clock className="w-4 h-4" strokeWidth={1.5} />
              <span>Búsquedas recientes:</span>
            </div>
            <button
              onClick={onClearRecent}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 font-light"
              title="Limpiar historial"
            >
              <X className="w-3 h-3" strokeWidth={1.5} />
              Limpiar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => onSelectRecent(search)}
                className="px-3 py-1.5 text-xs bg-blue-50/50 hover:bg-blue-50 text-blue-600 rounded-full transition-colors flex items-center gap-1 border border-blue-200/50 font-light"
                disabled={loading}
              >
                <MapPin className="w-3 h-3" strokeWidth={1.5} />
                {search.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}