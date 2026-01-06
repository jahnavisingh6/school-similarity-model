import { useMemo } from 'react';
import styles from '../styles/CompareSchools.module.css';
import type { School } from '../types';

interface CompareSchoolsProps {
  schools: School[];
  onRemove: (schoolId: number) => void;
  onClose: () => void;
}

function formatNumber(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return 'N/A';
  if (Number.isInteger(num)) return num.toLocaleString();
  return num.toFixed(1);
}

function formatCurrency(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return 'N/A';
  return `$${Math.round(num).toLocaleString()}`;
}

function formatPercentage(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return 'N/A';
  return `${Number(num).toFixed(1)}%`;
}

interface ComparisonRow {
  label: string;
  getValue: (school: School) => string;
  highlight?: 'higher' | 'lower';
}

const COMPARISON_ROWS: ComparisonRow[] = [
  { label: 'Location', getValue: (s) => `${s.city || ''}, ${s.state || ''}`.replace(/^, |, $/g, '') || 'N/A' },
  { label: 'Type', getValue: (s) => s.type || 'N/A' },
  { label: 'Setting', getValue: (s) => s.urban_rural || 'N/A' },
  { label: 'SAT Score', getValue: (s) => formatNumber(s.avg_sat), highlight: 'higher' },
  { label: 'ACT Score', getValue: (s) => formatNumber(s.avg_act), highlight: 'higher' },
  { label: 'Graduation Rate', getValue: (s) => formatPercentage(s.graduation_rate), highlight: 'higher' },
  { label: 'Acceptance Rate', getValue: (s) => formatPercentage(s.acceptance_rate) },
  { label: 'Student-Faculty Ratio', getValue: (s) => `${formatNumber(s.student_faculty_ratio)}:1`, highlight: 'lower' },
  { label: 'Tuition', getValue: (s) => formatCurrency(s.tuition_cost), highlight: 'lower' },
  { label: 'Avg. Financial Aid', getValue: (s) => formatCurrency(s.avg_aid), highlight: 'higher' },
  { label: 'Net Cost', getValue: (s) => formatCurrency((s.tuition_cost || 0) - (s.avg_aid || 0)), highlight: 'lower' },
  { label: 'Student Population', getValue: (s) => formatNumber(s.student_population) },
  { label: 'International %', getValue: (s) => formatPercentage(s.international_percentage) },
  { label: 'Ranking', getValue: (s) => s.ranking ? `#${s.ranking}` : 'N/A', highlight: 'lower' },
];

export default function CompareSchools({ schools, onRemove, onClose }: CompareSchoolsProps) {
  // Find best value for each row for highlighting
  const bestValues = useMemo(() => {
    const results: Record<string, number[]> = {};

    COMPARISON_ROWS.forEach((row, rowIndex) => {
      if (!row.highlight) return;

      const values = schools.map((school, i) => {
        const raw = row.getValue(school).replace(/[^0-9.-]/g, '');
        return { index: i, value: parseFloat(raw) || 0 };
      });

      const sorted = [...values].sort((a, b) =>
        row.highlight === 'higher' ? b.value - a.value : a.value - b.value
      );

      // Best value(s)
      const best = sorted[0]?.value;
      results[rowIndex] = values
        .filter(v => v.value === best && !isNaN(best))
        .map(v => v.index);
    });

    return results;
  }, [schools]);

  if (schools.length === 0) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Compare Schools</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.labelHeader}>Metric</th>
                {schools.map(school => (
                  <th key={school.school_id} className={styles.schoolHeader}>
                    <div className={styles.schoolHeaderContent}>
                      <a
                        href={school.website?.startsWith('http') ? school.website : `https://${school.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.schoolName}
                      >
                        {school.school_name}
                      </a>
                      <button
                        className={styles.removeButton}
                        onClick={() => onRemove(school.school_id)}
                        title="Remove from comparison"
                      >
                        ×
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, rowIndex) => (
                <tr key={row.label}>
                  <td className={styles.labelCell}>{row.label}</td>
                  {schools.map((school, schoolIndex) => (
                    <td
                      key={school.school_id}
                      className={`${styles.valueCell} ${
                        bestValues[rowIndex]?.includes(schoolIndex) ? styles.best : ''
                      }`}
                    >
                      {row.getValue(school)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
