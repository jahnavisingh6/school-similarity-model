import { useState, useCallback, useMemo } from 'react';
import styles from '../styles/StudentForm.module.css';
import type { StudentProfile, FeatureWeights, FormData, ValidationErrors, FeatureKey } from '../types';
import {
  validateField,
  isValidFormData,
  getEmptyFormData,
  VALIDATION_RULES
} from '../utils/validation';

interface StudentFormProps {
  onSubmit: (profile: StudentProfile) => void;
  featureWeights: FeatureWeights;
  onWeightsChange: (weights: FeatureWeights) => void;
  isLoading?: boolean;
}

const FEATURE_LABELS: Record<FeatureKey, string> = {
  avg_sat: 'SAT Score',
  avg_act: 'ACT Score',
  graduation_rate: 'Graduation Rate (%)',
  acceptance_rate: 'Acceptance Rate (%)',
  student_faculty_ratio: 'Student-Faculty Ratio',
  tuition_cost: 'Tuition Cost ($)',
  avg_aid: 'Average Financial Aid ($)',
  student_population: 'Student Population',
  international_percentage: 'International Student %',
  latitude: 'Latitude',
  longitude: 'Longitude',
  ranking: 'Ranking'
};

const FEATURE_KEYS: FeatureKey[] = Object.keys(FEATURE_LABELS) as FeatureKey[];

export default function StudentForm({
  onSubmit,
  featureWeights,
  onWeightsChange,
  isLoading = false
}: StudentFormProps) {
  const [formData, setFormData] = useState<FormData>(getEmptyFormData());
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showWeights, setShowWeights] = useState(false);

  const isFormValid = useMemo(() => isValidFormData(formData), [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as FeatureKey;

    setFormData(prev => ({
      ...prev,
      [key]: value === '' ? '' : parseFloat(value)
    }));

    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const key = name as FeatureKey;

    setTouched(prev => ({ ...prev, [key]: true }));

    // Validate on blur
    const error = validateField(key, formData[key]);
    if (error) {
      setErrors(prev => ({ ...prev, [key]: error }));
    }
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    FEATURE_KEYS.forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const validationErrors: ValidationErrors = {};
    FEATURE_KEYS.forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        validationErrors[key] = error;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Convert form data to student profile
    const profile: StudentProfile = {
      avg_sat: formData.avg_sat as number,
      avg_act: formData.avg_act as number,
      graduation_rate: formData.graduation_rate as number,
      acceptance_rate: formData.acceptance_rate as number,
      student_faculty_ratio: formData.student_faculty_ratio as number,
      tuition_cost: formData.tuition_cost as number,
      avg_aid: formData.avg_aid as number,
      student_population: formData.student_population as number,
      international_percentage: formData.international_percentage as number,
      latitude: formData.latitude === '' ? null : (formData.latitude as number),
      longitude: formData.longitude === '' ? null : (formData.longitude as number),
      ranking: formData.ranking as number
    };

    onSubmit(profile);
  }, [formData, onSubmit]);

  const handleWeightChange = useCallback((feature: FeatureKey, value: string) => {
    const numValue = parseFloat(value);
    const newWeights: FeatureWeights = {
      ...featureWeights,
      [feature]: isNaN(numValue) ? 1 : Math.max(0, Math.min(10, numValue))
    };
    onWeightsChange(newWeights);
  }, [featureWeights, onWeightsChange]);

  const getInputClassName = (key: FeatureKey): string => {
    const hasError = touched[key] && errors[key];
    return `${styles.input} ${hasError ? styles.inputError : ''}`;
  };

  const getPlaceholder = (key: FeatureKey): string => {
    const rule = VALIDATION_RULES[key];
    if (rule.required) {
      return `${rule.min} - ${rule.max}`;
    }
    return `${rule.min} - ${rule.max} (optional)`;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Your Profile</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          {FEATURE_KEYS.map(key => (
            <div key={key} className={styles.formGroup}>
              <label htmlFor={key} className={styles.label}>
                {FEATURE_LABELS[key]}
                {!VALIDATION_RULES[key].required && (
                  <span className={styles.optional}>(optional)</span>
                )}
              </label>
              <input
                type="number"
                id={key}
                name={key}
                value={formData[key]}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClassName(key)}
                step={key.includes('rate') || key.includes('percentage') ? '0.1' : '1'}
                placeholder={getPlaceholder(key)}
                disabled={isLoading}
              />
              {touched[key] && errors[key] && (
                <span className={styles.errorMessage}>{errors[key]}</span>
              )}
            </div>
          ))}
        </div>

        <div className={styles.weightsSection}>
          <button
            type="button"
            onClick={() => setShowWeights(!showWeights)}
            className={styles.weightsToggle}
          >
            {showWeights ? '▼' : '▶'} Feature Weights (Optional)
          </button>

          {showWeights && (
            <div className={styles.weightsGrid}>
              <p className={styles.weightsDescription}>
                Adjust importance of each feature (0 = ignore, 1 = default, up to 10 = very important)
              </p>
              {FEATURE_KEYS.map(key => (
                <div key={key} className={styles.weightGroup}>
                  <label htmlFor={`weight-${key}`} className={styles.weightLabel}>
                    {FEATURE_LABELS[key]}
                  </label>
                  <input
                    type="number"
                    id={`weight-${key}`}
                    value={featureWeights[key] ?? 1}
                    onChange={(e) => handleWeightChange(key, e.target.value)}
                    className={styles.weightInput}
                    min="0"
                    max="10"
                    step="0.1"
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? 'Finding...' : 'Find Similar Schools'}
        </button>
      </form>
    </div>
  );
}
