import React from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Droplets, Sun, CloudRain, TrendingUp, TrendingDown } from 'lucide-react';
import { dewPointC, fmt } from '../utils/weather';
import { uvCategory } from '../utils/riskCalculations';

interface TodaySummaryProps {
  meteo: any;
  obs: any;
  uvNow: number | null;
}

const colorMap = {
  red: {
    bg: 'bg-white',
    icon: 'text-red-500',
    value: 'text-gray-900',
    border: 'border-red-200/50'
  },
  blue: {
    bg: 'bg-white',
    icon: 'text-blue-500',
    value: 'text-gray-900',
    border: 'border-blue-200/50'
  },
  yellow: {
    bg: 'bg-white',
    icon: 'text-yellow-500',
    value: 'text-gray-900',
    border: 'border-yellow-200/50'
  },
  teal: {
    bg: 'bg-white',
    icon: 'text-teal-500',
    value: 'text-gray-900',
    border: 'border-teal-200/50'
  }
};

export function TodaySummary({ meteo, obs, uvNow }: TodaySummaryProps) {
  if (!meteo) return null;

  try {
    const tz = meteo?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const todayISO = new Date().toLocaleDateString('en-CA', { timeZone: tz });

    let tmin = null;
    let tmax = null;
    let current = null;

    if (meteo.hourly?.time?.length) {
      const { time, temperature_2m, relative_humidity_2m } = meteo.hourly;

      for (let i = 0; i < time.length; i++) {
        const ts = time[i];
        const temp = temperature_2m?.[i];

        if (typeof temp !== 'number') continue;

        if (ts.startsWith(todayISO)) {
          if (tmin === null || temp < tmin) tmin = temp;
          if (tmax === null || temp > tmax) tmax = temp;
        }

        const diff = Math.abs(new Date(ts).getTime() - Date.now());
        if (current === null || diff < current.diff) {
          current = { temp, rh: relative_humidity_2m?.[i], diff };
        }
      }
    }

    const cur = (typeof meteo.current?.temperature_2m === 'number')
      ? meteo.current.temperature_2m
      : current?.temp;
    const curRh = (typeof meteo.current?.relative_humidity_2m === 'number')
      ? meteo.current.relative_humidity_2m
      : current?.rh;
    const curTd = dewPointC(cur ?? null, curRh ?? null);
    const rain = meteo.current?.precipitation;
    const uvCat = uvCategory(uvNow);

    const MetricCard = ({ icon: Icon, label, value, unit, colorKey, subtitle }: any) => {
      const colors = colorMap[colorKey as keyof typeof colorMap];

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`${colors.bg} ${colors.border} border rounded-2xl p-4 md:p-5`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 ${colors.icon}`} strokeWidth={1.5} />
                <span className="text-xs font-light text-gray-500 uppercase tracking-wider">{label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl md:text-4xl font-light ${colors.value} tracking-tight`}>{value}</span>
                <span className={`text-base font-light ${colors.value} opacity-60`}>{unit}</span>
              </div>
              {subtitle && (
                <div className="text-xs text-gray-400 mt-2 font-light">{subtitle}</div>
              )}
            </div>
          </div>
        </motion.div>
      );
    };

    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-light tracking-tight text-gray-900 mb-6 flex items-center gap-3">
          <Thermometer className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
          Condiciones Actuales
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
          <MetricCard
            icon={Thermometer}
            label="Temperatura"
            value={fmt(cur, 1)}
            unit="°C"
            colorKey="red"
          />

          <MetricCard
            icon={Droplets}
            label="Humedad"
            value={fmt(curRh, 0)}
            unit="%"
            colorKey="blue"
            subtitle={`Rocío: ${fmt(curTd, 1)}°C`}
          />

          <MetricCard
            icon={Sun}
            label="Índice UV"
            value={fmt(uvNow, 1)}
            unit=""
            colorKey="yellow"
            subtitle={uvCat.level !== '—' ? uvCat.level : ''}
          />

          <MetricCard
            icon={CloudRain}
            label="Lluvia"
            value={fmt(rain, 1)}
            unit="mm/h"
            colorKey="teal"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white border border-gray-200/50 rounded-2xl p-5">
            <div className="text-xs font-light text-gray-500 mb-3 uppercase tracking-wider">Temp. mín / máx hoy</div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-blue-500" strokeWidth={1.5} />
                <span className="text-3xl font-light text-gray-900 tracking-tight">{fmt(tmin, 1)}°</span>
              </div>
              <div className="text-2xl text-gray-300 font-extralight">/</div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-500" strokeWidth={1.5} />
                <span className="text-3xl font-light text-gray-900 tracking-tight">{fmt(tmax, 1)}°</span>
              </div>
            </div>
          </div>

        </div>
      </motion.section>
    );
  } catch {
    return null;
  }
}
