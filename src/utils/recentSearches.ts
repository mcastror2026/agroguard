const RECENT_SEARCHES_KEY = 'agroguard:recent_searches';
const MAX_RECENT_SEARCHES = 5;

export interface RecentSearch {
  name: string;
  timestamp: number;
}

export function getRecentSearches(): RecentSearch[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addRecentSearch(search: Omit<RecentSearch, 'timestamp'>): void {
  try {
    const recent = getRecentSearches();

    // Extraer solo el nombre de la comuna (primera parte antes de la coma)
    const communeName = search.name.split(',')[0].trim();

    const exists = recent.findIndex(s => s.name === communeName);

    if (exists !== -1) {
      recent.splice(exists, 1);
    }

    const newSearch: RecentSearch = {
      name: communeName,
      timestamp: Date.now()
    };

    recent.unshift(newSearch);

    if (recent.length > MAX_RECENT_SEARCHES) {
      recent.splice(MAX_RECENT_SEARCHES);
    }

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
  } catch (error) {
    console.warn('Error saving recent search:', error);
  }
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.warn('Error clearing recent searches:', error);
  }
}
