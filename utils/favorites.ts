/**
 * Favorites management using localStorage
 */

const FAVORITES_KEY = 'school-favorites';

export function getFavorites(): number[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addFavorite(schoolId: number): number[] {
  const favorites = getFavorites();
  if (!favorites.includes(schoolId)) {
    favorites.push(schoolId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
  return favorites;
}

export function removeFavorite(schoolId: number): number[] {
  const favorites = getFavorites().filter(id => id !== schoolId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return favorites;
}

export function toggleFavorite(schoolId: number): { favorites: number[]; isFavorite: boolean } {
  const favorites = getFavorites();
  const isFavorite = favorites.includes(schoolId);

  if (isFavorite) {
    return { favorites: removeFavorite(schoolId), isFavorite: false };
  } else {
    return { favorites: addFavorite(schoolId), isFavorite: true };
  }
}

export function isFavorite(schoolId: number): boolean {
  return getFavorites().includes(schoolId);
}

export function clearFavorites(): void {
  localStorage.removeItem(FAVORITES_KEY);
}
