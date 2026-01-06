import { useState, useMemo } from 'react';
import styles from '../styles/Filters.module.css';
import type { School } from '../types';

export interface FilterState {
  states: string[];
  schoolTypes: string[];
  tuitionMin: number;
  tuitionMax: number;
  satMin: number;
  satMax: number;
}

interface FiltersProps {
  schools: School[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const DEFAULT_FILTERS: FilterState = {
  states: [],
  schoolTypes: [],
  tuitionMin: 0,
  tuitionMax: 100000,
  satMin: 400,
  satMax: 1600,
};

export function applyFilters(schools: School[], filters: FilterState): School[] {
  return schools.filter(school => {
    // State filter
    if (filters.states.length > 0 && school.state && !filters.states.includes(school.state)) {
      return false;
    }

    // School type filter
    if (filters.schoolTypes.length > 0 && !filters.schoolTypes.includes(school.type)) {
      return false;
    }

    // Tuition filter
    if (school.tuition_cost < filters.tuitionMin || school.tuition_cost > filters.tuitionMax) {
      return false;
    }

    // SAT filter
    if (school.avg_sat < filters.satMin || school.avg_sat > filters.satMax) {
      return false;
    }

    return true;
  });
}

export default function Filters({ schools, filters, onFiltersChange }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get unique states and school types from data
  const { states, schoolTypes } = useMemo(() => {
    const stateSet = new Set<string>();
    const typeSet = new Set<string>();

    schools.forEach(school => {
      if (school.state) stateSet.add(school.state);
      if (school.type) typeSet.add(school.type);
    });

    return {
      states: Array.from(stateSet).sort(),
      schoolTypes: Array.from(typeSet).sort(),
    };
  }, [schools]);

  const handleStateToggle = (state: string) => {
    const newStates = filters.states.includes(state)
      ? filters.states.filter(s => s !== state)
      : [...filters.states, state];
    onFiltersChange({ ...filters, states: newStates });
  };

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.schoolTypes.includes(type)
      ? filters.schoolTypes.filter(t => t !== type)
      : [...filters.schoolTypes, type];
    onFiltersChange({ ...filters, schoolTypes: newTypes });
  };

  const handleReset = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  const activeFilterCount =
    filters.states.length +
    filters.schoolTypes.length +
    (filters.tuitionMin > 0 ? 1 : 0) +
    (filters.tuitionMax < 100000 ? 1 : 0) +
    (filters.satMin > 400 ? 1 : 0) +
    (filters.satMax < 1600 ? 1 : 0);

  return (
    <div className={styles.container}>
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className={styles.badge}>{activeFilterCount}</span>
        )}
        <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>School Type</h4>
            <div className={styles.chips}>
              {schoolTypes.map(type => (
                <button
                  key={type}
                  className={`${styles.chip} ${filters.schoolTypes.includes(type) ? styles.active : ''}`}
                  onClick={() => handleTypeToggle(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Tuition Range</h4>
            <div className={styles.rangeInputs}>
              <div className={styles.rangeGroup}>
                <label>Min</label>
                <input
                  type="number"
                  value={filters.tuitionMin}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    tuitionMin: Math.max(0, parseInt(e.target.value) || 0)
                  })}
                  min={0}
                  max={100000}
                  step={1000}
                  className={styles.rangeInput}
                />
              </div>
              <span className={styles.rangeSeparator}>to</span>
              <div className={styles.rangeGroup}>
                <label>Max</label>
                <input
                  type="number"
                  value={filters.tuitionMax}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    tuitionMax: Math.min(100000, parseInt(e.target.value) || 100000)
                  })}
                  min={0}
                  max={100000}
                  step={1000}
                  className={styles.rangeInput}
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>SAT Score Range</h4>
            <div className={styles.rangeInputs}>
              <div className={styles.rangeGroup}>
                <label>Min</label>
                <input
                  type="number"
                  value={filters.satMin}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    satMin: Math.max(400, parseInt(e.target.value) || 400)
                  })}
                  min={400}
                  max={1600}
                  step={10}
                  className={styles.rangeInput}
                />
              </div>
              <span className={styles.rangeSeparator}>to</span>
              <div className={styles.rangeGroup}>
                <label>Max</label>
                <input
                  type="number"
                  value={filters.satMax}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    satMax: Math.min(1600, parseInt(e.target.value) || 1600)
                  })}
                  min={400}
                  max={1600}
                  step={10}
                  className={styles.rangeInput}
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              States
              <span className={styles.selectedCount}>
                ({filters.states.length} selected)
              </span>
            </h4>
            <div className={styles.stateGrid}>
              {states.map(state => (
                <button
                  key={state}
                  className={`${styles.stateChip} ${filters.states.includes(state) ? styles.active : ''}`}
                  onClick={() => handleStateToggle(state)}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.resetButton} onClick={handleReset}>
              Reset All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
