export const RISK_COLOR_MAP = {
  none: {
    border: 'border-gray-300',
    bg: 'bg-gray-50/30',
    text: 'text-gray-600',
    icon: 'text-gray-500',
    bgFull: 'bg-gray-50'
  },
  low: {
    border: 'border-green-300',
    bg: 'bg-green-50/30',
    text: 'text-green-600',
    icon: 'text-green-500',
    bgFull: 'bg-green-50'
  },
  medium: {
    border: 'border-yellow-300',
    bg: 'bg-yellow-50/30',
    text: 'text-yellow-600',
    icon: 'text-yellow-500',
    bgFull: 'bg-yellow-50'
  },
  high: {
    border: 'border-orange-300',
    bg: 'bg-orange-50/30',
    text: 'text-orange-600',
    icon: 'text-orange-500',
    bgFull: 'bg-orange-50'
  },
  critical: {
    border: 'border-red-300',
    bg: 'bg-red-50/30',
    text: 'text-red-600',
    icon: 'text-red-500',
    bgFull: 'bg-red-50'
  },
  severe: {
    border: 'border-red-600',
    bg: 'bg-red-100/40',
    text: 'text-red-700',
    icon: 'text-red-600',
    bgFull: 'bg-red-100'
  }
} as const;

export function getColorClasses(severity: 0 | 1 | 2 | 3 | 4) {
  const severityMap: Record<number, keyof typeof RISK_COLOR_MAP> = {
    0: 'none',
    1: 'low',
    2: 'medium',
    3: 'high',
    4: 'critical'
  };
  return RISK_COLOR_MAP[severityMap[severity]];
}

export function mapRiskColorStringToKey(colorString: string): string {
  if (colorString.includes('border-red-600')) return 'severe';
  if (colorString.includes('border-red-300')) return 'critical';
  if (colorString.includes('border-orange-300')) return 'high';
  if (colorString.includes('border-yellow-300')) return 'medium';
  if (colorString.includes('border-green-300')) return 'low';
  return 'none';
}
