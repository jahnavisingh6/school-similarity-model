import { useState, useEffect } from 'react';
import { getTheme, toggleTheme, applyTheme, type Theme } from '../utils/theme';
import styles from '../styles/ThemeToggle.module.css';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = getTheme();
    setTheme(current);
    applyTheme(current);
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const newTheme = toggleTheme();
    setTheme(newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <button
      className={styles.toggle}
      onClick={handleToggle}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
