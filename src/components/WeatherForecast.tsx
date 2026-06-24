import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun, Thermometer, Droplets } from 'lucide-react';
import { fmt } from '../utils/weather';

interface DailyData {
  date: string;
  pop: number | null;
  sum: number | null;
  tmin: number | null;
  tmax: number | null;
  uvmax: number | null;
}

interface WeatherForecastProps {
  dailyRain: DailyData[];
  rain24mm: number;
}

export function WeatherForecast({ dailyRain, rain24mm }: WeatherForecastProps) {
  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    }
    return date.toLocaleDateString('es-ES', { weekday: 'short' });
  };

  const getRainColor = (pop: number | null) => {
    if (!pop) return 'bg-white border-gray-200/50';
    if (pop < 30) return 'bg-blue-50/30 border-blue-200/50';
    if (pop < 60) return 'bg-blue-50/50 border-blue-200/70';
    return 'bg-blue-50/70 border-blue-300/70';
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="mb-8"
    >
      <h2 className="text-2xl md:text-3xl font-light tracking-tight text-gray-900 mb-6 flex items-center gap-3">
        <CloudRain className="w-6 h-6 text-blue-500" strokeWidth={1.5} />
        Pronóstico Meteorológico (5 días)
      </h2>

      <div className="mb-6 bg-blue-50/30 rounded-2xl p-5 border border-blue-200/50">
        <div className="flex items-center gap-3">
          <Cloud className="w-5 h-5 text-blue-500" strokeWidth={1.5} />
          <div>
            <div className="text-xs font-light text-gray-500 uppercase tracking-wider">Próximas 24 horas</div>
            <div className="text-2xl md:text-3xl font-light text-gray-900 tracking-tight">
              {fmt(rain24mm, 1)} mm
              <span className="text-sm font-light text-gray-500 ml-2">acumulado</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {dailyRain.map((day, index) => {
          const isToday = new Date(day.date).toDateString() === new Date().toDateString();

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`${getRainColor(day.pop)} border rounded-2xl p-3 md:p-4 ${
                isToday ? 'ring-1 ring-amber-400/50' : ''
              }`}
            >
              <div className="text-center">
                <div className={`font-light text-sm mb-1 ${isToday ? 'text-amber-600' : 'text-gray-900'}`}>
                  {getDayName(day.date)}
                </div>
                <div className="text-xs text-gray-400 mb-3 font-light">
                  {new Date(day.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </div>

                <div className="flex items-center justify-center mb-3">
                  {day.pop && day.pop > 40 ? (
                    <CloudRain className="w-8 h-8 md:w-10 md:h-10 text-blue-500" strokeWidth={1.5} />
                  ) : day.pop && day.pop > 20 ? (
                    <Cloud className="w-8 h-8 md:w-10 md:h-10 text-gray-400" strokeWidth={1.5} />
                  ) : (
                    <Sun className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" strokeWidth={1.5} />
                  )}
                </div>

                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <Thermometer className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                    <span className="font-light text-gray-900">{fmt(day.tmax, 0)}°</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Thermometer className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
                    <span className="font-light text-gray-900">{fmt(day.tmin, 0)}°</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200/50 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <Droplets className="w-3 h-3 text-blue-500" strokeWidth={1.5} />
                    <span className="font-light text-gray-700">{fmt(day.pop, 0)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <CloudRain className="w-3 h-3 text-blue-500" strokeWidth={1.5} />
                    <span className="font-light text-gray-700">{fmt(day.sum, 1)} mm</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <Sun className="w-3 h-3 text-yellow-500" strokeWidth={1.5} />
                    <span className="font-light text-gray-700">UV {fmt(day.uvmax, 0)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {!dailyRain.length && (
          <div className="col-span-2 md:col-span-5 bg-white border border-gray-200/50 rounded-2xl p-8 text-center">
            <Cloud className="w-12 h-12 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
            <div className="text-gray-900 font-light">Sin datos de pronóstico</div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
