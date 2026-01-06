import { getTheme, setTheme, toggleTheme, applyTheme } from './theme';

describe('Theme Utility', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  describe('getTheme', () => {
    it('should return light as default', () => {
      expect(getTheme()).toBe('light');
    });

    it('should return stored theme', () => {
      localStorage.setItem('school-theme', 'dark');
      expect(getTheme()).toBe('dark');
    });

    it('should return light for invalid stored value', () => {
      localStorage.setItem('school-theme', 'invalid');
      expect(getTheme()).toBe('light');
    });
  });

  describe('setTheme', () => {
    it('should save dark theme to localStorage', () => {
      setTheme('dark');
      expect(localStorage.getItem('school-theme')).toBe('dark');
    });

    it('should save light theme to localStorage', () => {
      setTheme('light');
      expect(localStorage.getItem('school-theme')).toBe('light');
    });

    it('should apply theme to document', () => {
      setTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      setTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      localStorage.setItem('school-theme', 'light');
      const result = toggleTheme();
      expect(result).toBe('dark');
      expect(getTheme()).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      localStorage.setItem('school-theme', 'dark');
      const result = toggleTheme();
      expect(result).toBe('light');
      expect(getTheme()).toBe('light');
    });
  });

  describe('applyTheme', () => {
    it('should add dark class for dark theme', () => {
      applyTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should remove dark class for light theme', () => {
      document.documentElement.classList.add('dark');
      applyTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});
