export interface Variety {
  name: string;
  minHours: number;
  maxHours: number;
}

export interface Crop {
  name: string;
  emoji: string;
  varieties: Variety[];
}

export const CROPS: Crop[] = [
  {
    name: 'Cerezo',
    emoji: '🍒',
    varieties: [
      { name: 'Lapins / Rainier (temprana)', minHours: 400, maxHours: 800 },
      { name: 'Sweetheart (media)', minHours: 850, maxHours: 980 },
      { name: 'Bing (tardía)', minHours: 1000, maxHours: 1200 },
    ]
  },
  {
    name: 'Manzano',
    emoji: '🍎',
    varieties: [
      { name: 'Variedades estándar', minHours: 900, maxHours: 1400 },
    ]
  },
  {
    name: 'Durazno / Nectarino',
    emoji: '🍑',
    varieties: [
      { name: 'Variedades tempranas', minHours: 200, maxHours: 500 },
      { name: 'Andross y similares', minHours: 700, maxHours: 900 },
    ]
  },
  {
    name: 'Peral',
    emoji: '🍐',
    varieties: [
      { name: 'Variedades estándar', minHours: 620, maxHours: 1000 },
    ]
  },
  {
    name: 'Nogal',
    emoji: '🌰',
    varieties: [
      { name: 'Serr', minHours: 600, maxHours: 700 },
      { name: 'Chandler', minHours: 750, maxHours: 850 },
    ]
  },
  {
    name: 'Vid',
    emoji: '🍇',
    varieties: [
      { name: 'Thompson y similares', minHours: 400, maxHours: 500 },
    ]
  },
];

export function getSeasonStart(): string {
  const now = new Date();
  const year = now.getMonth() >= 4 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-05-01`;
}

export function countColdHours(temperatures: number[]): number {
  return temperatures.filter(t => typeof t === 'number' && t < 7).length;
}

export function countColdHoursByWeek(times: string[], temperatures: number[]): { week: string; hours: number }[] {
  const weeks: Record<string, number> = {};

  for (let i = 0; i < times.length; i++) {
    const t = temperatures[i];
    if (typeof t !== 'number' || t >= 7) continue;

    const date = new Date(times[i]);
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    const key = monday.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

    weeks[key] = (weeks[key] || 0) + 1;
  }

  return Object.entries(weeks).map(([week, hours]) => ({ week, hours }));
}
