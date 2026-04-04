import styles from '../styles/GoalMatches.module.css';
import type { GoalMatchResult } from '../types';

interface GoalMatchesProps {
  matches: GoalMatchResult[];
}

export default function GoalMatches({ matches }: GoalMatchesProps) {
  if (!matches.length) {
    return null;
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Your Goal School Fit</h2>
        <p className={styles.description}>
          These scores show how closely your profile matches the universities you picked.
        </p>
      </div>

      <div className={styles.grid}>
        {matches.map((match) => (
          <article key={match.school.school_id} className={styles.card}>
            <div className={styles.score}>{(match.score * 100).toFixed(1)}% close</div>
            <h3 className={styles.schoolName}>{match.school.school_name}</h3>
            <p className={styles.meta}>
              {[match.school.city, match.school.state].filter(Boolean).join(', ') || match.school.type}
            </p>
            <p className={styles.rank}>
              Overall similarity rank: {match.rank ? `#${match.rank}` : 'Not ranked'}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
