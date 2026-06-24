import { dewPointC } from './weather';

export interface RiskCategory {
  level: string;
  color: string;
  tip: string;
  severity: 0 | 1 | 2 | 3 | 4;
}

export interface DiseaseRisk {
  name: string;
  nameEs: string;
  level: string;
  severity: 0 | 1 | 2 | 3 | 4;
  color: string;
  tip: string;
}

export function frostCategory(tmin: number | null, windSpeed: number | null = null): RiskCategory {
  if (tmin === null || tmin === undefined) {
    return {
      level: "—",
      color: "border-gray-300 text-gray-600",
      tip: "Sin datos",
      severity: 0
    };
  }

  const t = Number(tmin);
  const effectiveTemp = windSpeed && windSpeed < 2 ? t : t + 1;

  if (t <= -2) return {
    level: "Severo",
    color: "border-red-600 text-red-700",
    tip: "Helada severa. Daño generalizado a plantas. Implementa todas las medidas de protección.",
    severity: 4
  };
  if (t <= 0) return {
    level: "Alto",
    color: "border-red-300 text-red-600",
    tip: "Helada probable. Daño a yemas florales. Activa riego o calefacción.",
    severity: 3
  };
  if (t <= 2) return {
    level: "Medio",
    color: "border-orange-300 text-orange-600",
    tip: "Riesgo moderado de helada. Monitorea temperatura y humedad.",
    severity: 2
  };
  if (t <= 4) return {
    level: "Bajo",
    color: "border-yellow-300 text-yellow-600",
    tip: "Posible helada débil. Mantente vigilante.",
    severity: 1
  };

  return {
    level: "Mínimo",
    color: "border-green-300 text-green-600",
    tip: "Sin riesgo inmediato de helada. Operaciones normales.",
    severity: 0
  };
}

export interface HourlyData {
  temp: number | null;
  rh: number | null;
  rain: number | null;
  [key: string]: any;
}

export function fungalRisk(hours: HourlyData[]): RiskCategory {
  if (!hours || hours.length === 0) {
    return {
      level: "—",
      color: "border-gray-300 text-gray-600",
      tip: "Sin datos disponibles",
      severity: 0
    };
  }

  let highRiskHours = 0, mediumRiskHours = 0, wetHours = 0;
  let consecutiveHighRisk = 0, maxConsecutiveHigh = 0;
  let consecutiveMediumRisk = 0, maxConsecutiveMedium = 0;

  for (const h of hours) {
    const td = dewPointC(h.temp, h.rh);
    const nearCond = typeof td === 'number' ? (h.temp! - td <= 1.0) : false;
    const leafWet = (h.rh! >= 90) || (h.rain && h.rain > 0);

    if (leafWet || nearCond) wetHours++;

    const isHighRisk = h.rh! >= 85 && h.temp! >= 12 && h.temp! <= 25;
    if (isHighRisk) {
      highRiskHours++;
      consecutiveHighRisk++;
      maxConsecutiveHigh = Math.max(maxConsecutiveHigh, consecutiveHighRisk);
    } else {
      consecutiveHighRisk = 0;
    }

    const isMediumRisk = h.rh! >= 80 && h.temp! >= 10 && h.temp! <= 28;
    if (isMediumRisk) {
      mediumRiskHours++;
      consecutiveMediumRisk++;
      maxConsecutiveMedium = Math.max(maxConsecutiveMedium, consecutiveMediumRisk);
    } else {
      consecutiveMediumRisk = 0;
    }
  }

  if (highRiskHours >= 8 || wetHours >= 8 || maxConsecutiveHigh >= 6) {
    return {
      level: "Alto",
      color: "border-red-300 text-red-600",
      tip: "Condiciones favorables para Botrytis, Oidio y Mildiu. Aumenta vigilancia; aplica fungicidas preventivos.",
      severity: 3
    };
  }

  if (mediumRiskHours >= 4 || wetHours >= 4 || maxConsecutiveMedium >= 4) {
    return {
      level: "Medio",
      color: "border-orange-300 text-orange-600",
      tip: "Algunas horas favorables para hongos. Refuerza vigilancia y riegos preventivos.",
      severity: 2
    };
  }

  return {
    level: "Bajo",
    color: "border-yellow-300 text-yellow-600",
    tip: "Riesgo limitado de infección fúngica. Continúa monitoreo rutinario.",
    severity: 1
  };
}

export function uvCategory(uv: number | null, month: number | null = null): RiskCategory {
  if (uv === null || uv === undefined || Number.isNaN(+uv)) {
    return {
      level: "—",
      color: "border-gray-300 text-gray-600",
      tip: "Sin datos de UV disponibles",
      severity: 0
    };
  }

  const u = +uv;
  const isSpringMonth = month ? [9, 10, 11].includes(month) : false;

  if (u < 3) return {
    level: "Bajo",
    color: "border-green-300 text-green-600",
    tip: "Exposición segura. Trabajos al aire libre normales.",
    severity: 0
  };
  if (u < 6) return {
    level: "Moderado",
    color: "border-yellow-300 text-yellow-600",
    tip: "Protección básica: sombrero, anteojos UV. Evita exposición entre 10:00-16:00.",
    severity: 1
  };
  if (u < 8) return {
    level: "Alto",
    color: "border-orange-300 text-orange-600",
    tip: "Protección máxima: bloqueador SPF 50+, camiseta, sombrero. Limita exposición prolongada.",
    severity: 2
  };
  if (u < 11) return {
    level: "Muy alto",
    color: "border-red-300 text-red-600",
    tip: isSpringMonth
      ? "Extremo: Época de adelgazamiento de ozono. Evita sol entre 10:00-16:00. Protector SPF 50+, ropa completa."
      : "Muy intenso: Trabajos de campo sólo antes de 9:00 o después de 17:00.",
    severity: 3
  };

  return {
    level: "Extremo",
    color: "border-red-600 text-red-700",
    tip: isSpringMonth
      ? "Peligro crítico: Adelgazamiento de ozono máximo. Reprogramar trabajos para indoors o noche."
      : "Riesgo extremo: Reprogramar tareas para áreas cubiertas o después del atardecer.",
    severity: 4
  };
}