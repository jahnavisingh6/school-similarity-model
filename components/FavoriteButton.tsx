import { useState, useEffect } from 'react';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import styles from '../styles/FavoriteButton.module.css';

interface FavoriteButtonProps {
  schoolId: number;
  onToggle?: (isFavorite: boolean) => void;
}

export default function FavoriteButton({ schoolId, onToggle }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite(schoolId));
    setMounted(true);
  }, [schoolId]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleFavorite(schoolId);
    setFavorited(result.isFavorite);
    onToggle?.(result.isFavorite);
  };

  if (!mounted) return null;

  return (
    <button
      className={`${styles.button} ${favorited ? styles.active : ''}`}
      onClick={handleClick}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {favorited ? '❤️' : '🤍'}
    </button>
  );
}
