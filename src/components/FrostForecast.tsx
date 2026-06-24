import React from 'react';
import { motion } from 'framer-motion';
import { Snowflake, AlertTriangle, Clock } from 'lucide-react';
import { fmt } from '../utils/weather';

interface FrostBand {
  start: Date;
  end: Date;
  tmin: number;
  level: string;
  color: string;
  tip: string;
}

interface FrostForecastProps {
  frostBands: FrostBand[];
  focusNight: boolean;
}

export function FrostForecast({ frostBands, focusNight }: FrostForecastProps) {
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string, border: string, text: string, icon: string }> = {
      'bg-emerald-100 text-emerald-800': { bg: 'bg-emerald-50/30', border: 'border-emerald-200/50', text: 'text-gray-900', icon: 'text-emerald-500' },
      'bg-green-100 text-green-800': { bg: 'bg-green-50/30', border: 'border-green-200/50', text: 'text-gray-900', icon: 'text-green-500' },
      'bg-yellow-100 text-yellow-800': { bg: 'bg-yellow-50/30', border: 'border-yellow-200/50', text: 'text-gray-900', icon: 'text-yellow-500' },
      'bg-orange-100 text-orange-800': { bg: 'bg-orange-50/30', border: 'border-orange-200/50', text: 'text-gray-900', icon: 'text-orange-500' },
      'bg-red-100 text-red-800': { bg: 'bg-red-50/30', border: 'border-red-200/50', text: 'text-gray-900', icon: 'text-red-500' },
    };
    return colorMap[color] || { bg: 'bg-gray-50/30', border: 'border-gray-200/50', text: 'text-gray-900', icon: 'text-gray-500' };
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-light tracking-tight text-gray-900 flex items-center gap-3">
          <Snowflake className="w-6 h-6 text-blue-500" strokeWidth={1.5} />
          Pronóstico de Heladas (48h)
        </h2>
        {focusNight && (
          <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-light border border-blue-200/50">
            NOCTURNO
          </span>
        )}
      </div>

      <div className="space-y-3">
        {frostBands.map((band, index) => {
          const colors = getColorClasses(band.color);
          const isHighRisk = band.tmin < 0;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`${colors.bg} ${colors.border} border rounded-2xl p-4 md:p-5 bg-white`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {isHighRisk ? (
                      <AlertTriangle className={`w-5 h-5 ${colors.icon}`} strokeWidth={1.5} />
                    ) : (
                      <Snowflake className={`w-5 h-5 ${colors.icon}`} strokeWidth={1.5} />
                    )}
                    <div>
                      <div className={`font-light ${colors.text}`}>
                        {band.start.toLocaleDateString('es-ES', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 font-light">
                        <Clock className="w-3 h-3" strokeWidth={1.5} />
                        {band.start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} -
                        {band.end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="ml-8">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-light ${band.color}`}>
                      {band.level}
                    </div>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed font-light">
                      {band.tip}
                    </p>
                  </div>
                </div>

                <div className="ml-2 md:ml-4 text-right">
                  <div className={`text-3xl md:text-4xl font-light ${colors.text} tracking-tight`}>
                    {fmt(band.tmin, 1)}°
                  </div>
                  <div className="text-xs text-gray-400 mt-1 font-light uppercase tracking-wider">mín</div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {!frostBands.length && (
          <div className="bg-white border border-gray-200/50 rounded-2xl p-8 text-center">
            <Snowflake className="w-12 h-12 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
            <div className="text-gray-900 font-light mb-1">Sin datos de heladas</div>
            <div className="text-sm text-gray-400 font-light">
              {focusNight ? 'Intenta desactivar el modo nocturno' : 'No hay datos disponibles para esta ubicación'}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
