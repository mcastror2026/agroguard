// Contador de visitas usando localStorage y CountAPI
const VISIT_COUNTER_KEY = "agroguard:visit_counter";
const DEVICE_ID_KEY = "agroguard:device_id";

// CountAPI - servicio gratuito de contador
const COUNT_API_URL = "https://api.countapi.xyz";
const NAMESPACE = "agroguard";
const KEY = "visits";

// Generar un ID único para este dispositivo/navegador
function getOrCreateDeviceId(): string {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return 'dev_unknown';
  }
}

// Contador global usando CountAPI - INCREMENTA CON CADA CARGA DE PÁGINA
export async function incrementGlobalCounter(): Promise<number | null> {
  try {
    // Incrementar el contador usando CountAPI
    const response = await fetch(`${COUNT_API_URL}/hit/${NAMESPACE}/${KEY}`, {
      method: 'GET'
    });

    if (!response.ok) throw new Error('CountAPI error');

    const data = await response.json();
    return data?.value || null;
  } catch (error) {
    console.warn('No se pudo actualizar el contador global:', error);

    // Fallback: usar localStorage para simular contador global
    const fallbackKey = 'agroguard:global_fallback';
    try {
      let fallbackCount = parseInt(localStorage.getItem(fallbackKey) || '500');
      fallbackCount += 1;
      localStorage.setItem(fallbackKey, fallbackCount.toString());
      return fallbackCount;
    } catch {
      return null;
    }
  }
}

export async function getGlobalCounter(): Promise<number | null> {
  try {
    const response = await fetch(`${COUNT_API_URL}/get/${NAMESPACE}/${KEY}`, {
      method: 'GET'
    });

    if (!response.ok) throw new Error('CountAPI error');

    const data = await response.json();
    return data?.value || null;
  } catch (error) {
    console.warn('No se pudo obtener el contador global:', error);

    // Fallback: usar localStorage
    const fallbackKey = 'agroguard:global_fallback';
    try {
      return parseInt(localStorage.getItem(fallbackKey) || '500');
    } catch {
      return null;
    }
  }
}

// Contador local del dispositivo - se incrementa con cada carga de página
export function incrementVisitCounter(): number {
  try {
    const currentCount = getVisitCount();
    const newCount = currentCount + 1;

    localStorage.setItem(VISIT_COUNTER_KEY, newCount.toString());

    return newCount;
  } catch {
    return 1;
  }
}

export function getVisitCount(): number {
  try {
    const count = localStorage.getItem(VISIT_COUNTER_KEY);
    return count ? parseInt(count, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

// Función para formatear el número de visitas
export function formatVisitCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  } else if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}k`;
  } else {
    return `${(count / 1000000).toFixed(1)}M`;
  }
}
