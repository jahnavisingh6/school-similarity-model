import styles from '../styles/TopSchools.module.css';
import type { SimilarityResult } from '../types';
import FavoriteButton from './FavoriteButton';

interface TopSchoolsProps {
  results: SimilarityResult[];
  compareList?: number[];
  onCompareToggle?: (schoolId: number) => void;
}

function formatNumber(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return 'N/A';
  if (typeof num === 'number') {
    if (Number.isInteger(num)) return num.toLocaleString();
    return num.toFixed(2);
  }
  return String(num);
}

function formatCurrency(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return 'N/A';
  return `$${Math.round(num).toLocaleString()}`;
}

function formatPercentage(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return 'N/A';
  return `${Number(num).toFixed(1)}%`;
}

export default function TopSchools({ results, compareList = [], onCompareToggle }: TopSchoolsProps) {
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Top {results.length} Most Similar Schools</h2>
      <div className={styles.resultsGrid}>
        {results.map((result, index) => (
          <div key={result.school.school_id ?? index} className={styles.schoolCard}>
            <div className={styles.cardHeader}>
              <div className={styles.rankBadge}>#{index + 1}</div>
              <div className={styles.cardActions}>
                <FavoriteButton schoolId={result.school.school_id} />
                {onCompareToggle && (
                  <label className={styles.compareCheckbox}>
                    <input
                      type="checkbox"
                      checked={compareList.includes(result.school.school_id)}
                      onChange={() => onCompareToggle(result.school.school_id)}
                    />
                    <span>Compare</span>
                  </label>
                )}
              </div>
            </div>
            <div className={styles.similarityScore}>
              {(result.score * 100).toFixed(1)}% match
            </div>
            <h3 className={styles.schoolName}>
              {result.school.website ? (
                <a href={result.school.website.startsWith('http') ? result.school.website : `https://${result.school.website}`}
                   target="_blank"
                   rel="noopener noreferrer">
                  {result.school.school_name}
                </a>
              ) : (
                result.school.school_name
              )}
            </h3>
            <div className={styles.schoolDetails}>
              {(result.school.city || result.school.state) && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Location:</span>
                  <span className={styles.detailValue}>
                    {[result.school.city, result.school.state].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Type:</span>
                <span className={styles.detailValue}>{result.school.type}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Setting:</span>
                <span className={styles.detailValue}>{result.school.urban_rural}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>SAT Score:</span>
                <span className={styles.detailValue}>{formatNumber(result.school.avg_sat)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>ACT Score:</span>
                <span className={styles.detailValue}>{formatNumber(result.school.avg_act)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Graduation Rate:</span>
                <span className={styles.detailValue}>{formatPercentage(result.school.graduation_rate)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Acceptance Rate:</span>
                <span className={styles.detailValue}>{formatPercentage(result.school.acceptance_rate)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Student-Faculty Ratio:</span>
                <span className={styles.detailValue}>{formatNumber(result.school.student_faculty_ratio)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Tuition:</span>
                <span className={styles.detailValue}>{formatCurrency(result.school.tuition_cost)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Avg. Financial Aid:</span>
                <span className={styles.detailValue}>{formatCurrency(result.school.avg_aid)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Student Population:</span>
                <span className={styles.detailValue}>{formatNumber(result.school.student_population)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>International %:</span>
                <span className={styles.detailValue}>{formatPercentage(result.school.international_percentage)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel} title="Composite ranking based on SAT, graduation rate, acceptance rate, and student-faculty ratio">Ranking:</span>
                <span className={styles.detailValue}>#{formatNumber(result.school.ranking)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
