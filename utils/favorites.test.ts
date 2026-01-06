import { getFavorites, addFavorite, removeFavorite, toggleFavorite, isFavorite, clearFavorites } from './favorites';

describe('Favorites Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getFavorites', () => {
    it('should return empty array when no favorites exist', () => {
      expect(getFavorites()).toEqual([]);
    });

    it('should return stored favorites', () => {
      localStorage.setItem('school-favorites', JSON.stringify([1, 2, 3]));
      expect(getFavorites()).toEqual([1, 2, 3]);
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('school-favorites', 'invalid json');
      expect(getFavorites()).toEqual([]);
    });
  });

  describe('addFavorite', () => {
    it('should add a new favorite', () => {
      const result = addFavorite(1);
      expect(result).toContain(1);
      expect(getFavorites()).toContain(1);
    });

    it('should not add duplicate favorites', () => {
      addFavorite(1);
      const result = addFavorite(1);
      expect(result.filter(id => id === 1)).toHaveLength(1);
    });

    it('should preserve existing favorites', () => {
      addFavorite(1);
      addFavorite(2);
      expect(getFavorites()).toEqual([1, 2]);
    });
  });

  describe('removeFavorite', () => {
    it('should remove an existing favorite', () => {
      addFavorite(1);
      addFavorite(2);
      const result = removeFavorite(1);
      expect(result).not.toContain(1);
      expect(result).toContain(2);
    });

    it('should handle removing non-existent favorite', () => {
      addFavorite(1);
      const result = removeFavorite(999);
      expect(result).toEqual([1]);
    });
  });

  describe('toggleFavorite', () => {
    it('should add favorite if not exists', () => {
      const { favorites, isFavorite } = toggleFavorite(1);
      expect(isFavorite).toBe(true);
      expect(favorites).toContain(1);
    });

    it('should remove favorite if exists', () => {
      addFavorite(1);
      const { favorites, isFavorite } = toggleFavorite(1);
      expect(isFavorite).toBe(false);
      expect(favorites).not.toContain(1);
    });
  });

  describe('isFavorite', () => {
    it('should return true for favorited school', () => {
      addFavorite(1);
      expect(isFavorite(1)).toBe(true);
    });

    it('should return false for non-favorited school', () => {
      expect(isFavorite(999)).toBe(false);
    });
  });

  describe('clearFavorites', () => {
    it('should remove all favorites', () => {
      addFavorite(1);
      addFavorite(2);
      clearFavorites();
      expect(getFavorites()).toEqual([]);
    });
  });
});
