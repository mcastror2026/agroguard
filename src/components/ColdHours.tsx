import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Snowflake, Thermometer, ChevronDown } from 'lucide-react';
import { CROPS, Variety, countColdHoursByWeek } from '../utils/coldHours';

interface ColdHoursProps {
  times: string[];
  temperatures: number[];
  totalHours: number;
  loading: boolean;
  seasonStart: string;
}

export function ColdHours({ times, temperatures, totalHours, loading, seasonStart }: ColdHoursProps) {
  const [selectedCropIdx, setSelectedCropIdx] = useState(0);
  const [selectedVarietyIdx, setSelectedVarietyIdx] = useState(0);

  const crop = CROPS[selectedCropIdx];
  const variety: Variety = crop.varieties[selectedVarietyIdx];
  const target = Math.round((variety.minHours + variety.maxHours) / 2);
  const progress = Math.min(100, Math.round((totalHours / target) * 100));
  const remaining = Math.max(0, target - totalHours);

  const weeklyData = countColdHoursByWeek(times, temperatures);

  const progressColor =
    progress >= 100 ? 'bg-emerald-500' :
    progress >= 60  ? 'bg-blue-500' :
    progress >= 30  ? 'bg-amber-500' :
    'bg-red-400';

  const statusText =
    progress >= 100 ? '✅ Requerimiento cumplido' :
    progress >= 60  ? '🔵 Avance satisfactorio' :
    progress >= 30  ? '🟡 Acumulación en progreso' :
    '🔴 Acumulación insuficiente';

  const isOffSeason = () => {
    const month = new Date().getMonth() + 1;
    return month < 5 || month > 9;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-20" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isOffSeason() && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm font-light">
          ℹ️ La temporada de acumulación de horas frío es de mayo a agosto. Los datos mostrados corresponden a la última temporada registrada.
        </div>
      )}

      {/* Selectores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div>
          <label className="text-xs text-gray-500 font-light uppercase tracking-wider mb-1 block">Cultivo</label>
          <div className="relative">
            <select
              value={selectedCropIdx}
              onChange={e => { setSelectedCropIdx(+e.target.value); setSelectedVarietyIdx(0); }}
              className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-gray-900 font-light focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {CROPS.map((c, i) => (
                <option key={i} value={i}>{c.emoji} {c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.5} />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 font-light uppercase tracking-wider mb-1 block">Variedad</label>
          <div className="relative">
            <select
              value={selectedVarietyIdx}
              onChange={e => setSelectedVarietyIdx(+e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-gray-900 font-light focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {crop.varieties.map((v, i) => (
                <option key={i} value={i}>{v.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Card principal */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-light mb-1">
              Horas frío acumuladas desde {new Date(seasonStart).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-light text-gray-900 tracking-tight">{totalHours}</span>
              <span className="text-lg text-gray-400 font-light">h</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 font-light mb-1">Objetivo {crop.emoji}</div>
            <div className="text-2xl font-light text-gray-700">{target} h</div>
            <div className="text-xs text-gray-400 font-light">({variety.minHours}–{variety.maxHours} h)</div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 font-light mb-1">
            <span>0 h</span>
            <span>{target} h</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${progressColor}`}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-light text-gray-700">{statusText}</span>
            <span className="text-sm font-light text-gray-500">{progress}%</span>
          </div>
        </div>

        {remaining > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-700 font-light">
            Faltan <span className="font-normal">{remaining} horas frío</span> para completar el requerimiento de {variety.name}.
          </div>
        )}
      </div>

      {/* Desglose semanal */}
      {weeklyData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Thermometer className="w-5 h-5 text-blue-500" strokeWidth={1.5} />
            <h3 className="text-sm font-light text-gray-700 uppercase tracking-wider">Acumulación semanal</h3>
          </div>
          <div className="space-y-3">
            {weeklyData.slice(-8).map(({ week, hours }, i) => {
              const maxHours = Math.max(...weeklyData.map(w => w.hours));
              const pct = Math.round((hours / maxHours) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-xs text-gray-400 font-light w-20 shrink-0">{week}</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 font-light w-12 text-right">{hours} h</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-gray-400 font-light">
            ⚠️ Datos de modelos globales (Open-Meteo). Verifique con estación meteorológica local.
          </div>
        </div>
      )}
    </motion.div>
  );
}
