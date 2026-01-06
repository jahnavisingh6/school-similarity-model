/**
 * Validation utilities for student profile and feature weights
 */

import type { StudentProfile, ValidationErrors, FeatureWeights, FormData, FeatureKey } from '../types';

// Validation rules for each field
interface ValidationRule {
  min: number;
  max: number;
  required: boolean;
  label: string;
}

export const VALIDATION_RULES: Record<FeatureKey, ValidationRule> = {
  avg_sat: { min: 400, max: 1600, required: true, label: 'SAT Score' },
  avg_act: { min: 1, max: 36, required: true, label: 'ACT Score' },
  graduation_rate: { min: 0, max: 100, required: true, label: 'Graduation Rate' },
  acceptance_rate: { min: 0, max: 100, required: true, label: 'Acceptance Rate' },
  student_faculty_ratio: { min: 1, max: 100, required: true, label: 'Student-Faculty Ratio' },
  tuition_cost: { min: 0, max: 100000, required: true, label: 'Tuition Cost' },
  avg_aid: { min: 0, max: 100000, required: true, label: 'Average Financial Aid' },
  student_population: { min: 100, max: 100000, required: true, label: 'Student Population' },
  international_percentage: { min: 0, max: 100, required: true, label: 'International Student %' },
  latitude: { min: -90, max: 90, required: false, label: 'Latitude' },
  longitude: { min: -180, max: 180, required: false, label: 'Longitude' },
  ranking: { min: 1, max: 500, required: true, label: 'Ranking' }
};

/**
 * Validate a single field value
 */
export function validateField(
  key: FeatureKey,
  value: number | '' | null | undefined
): string | undefined {
  const rule = VALIDATION_RULES[key];

  // Check if required
  if (value === '' || value === null || value === undefined) {
    if (rule.required) {
      return `${rule.label} is required`;
    }
    return undefined; // Optional field, empty is OK
  }

  // Check if it's a valid number
  if (typeof value !== 'number' || isNaN(value)) {
    return `${rule.label} must be a valid number`;
  }

  // Check range
  if (value < rule.min || value > rule.max) {
    return `${rule.label} must be between ${rule.min} and ${rule.max}`;
  }

  return undefined;
}

/**
 * Validate the entire student profile form data
 * Returns an object with field-specific error messages
 */
export function validateFormData(formData: FormData): ValidationErrors {
  const errors: ValidationErrors = {};

  (Object.keys(VALIDATION_RULES) as FeatureKey[]).forEach(key => {
    const error = validateField(key, formData[key]);
    if (error) {
      errors[key] = error;
    }
  });

  return errors;
}

/**
 * Validate a submitted student profile (after form processing)
 * Returns an object with field-specific error messages
 */
export function validateStudentProfile(profile: StudentProfile): ValidationErrors {
  const errors: ValidationErrors = {};

  (Object.keys(VALIDATION_RULES) as FeatureKey[]).forEach(key => {
    const value = profile[key];
    const rule = VALIDATION_RULES[key];

    // For required fields, null/undefined means missing
    if (rule.required && (value === null || value === undefined)) {
      errors[key] = `${rule.label} is required`;
      return;
    }

    // Skip validation for optional fields that are null
    if (!rule.required && value === null) {
      return;
    }

    // Type check
    if (value !== null && (typeof value !== 'number' || isNaN(value))) {
      errors[key] = `${rule.label} must be a valid number`;
      return;
    }

    // Range check (only for non-null values)
    if (value !== null && (value < rule.min || value > rule.max)) {
      errors[key] = `${rule.label} must be between ${rule.min} and ${rule.max}`;
    }
  });

  return errors;
}

/**
 * Check if the form data is valid
 */
export function isValidFormData(formData: FormData): boolean {
  const errors = validateFormData(formData);
  return Object.keys(errors).length === 0;
}

/**
 * Check if the student profile is valid
 */
export function isValidProfile(profile: StudentProfile): boolean {
  const errors = validateStudentProfile(profile);
  return Object.keys(errors).length === 0;
}

/**
 * Validate feature weights
 */
export function validateFeatureWeights(weights: FeatureWeights): ValidationErrors {
  const errors: ValidationErrors = {};

  (Object.keys(weights) as FeatureKey[]).forEach(key => {
    const value = weights[key];

    if (typeof value !== 'number' || isNaN(value)) {
      errors[key] = 'Weight must be a valid number';
      return;
    }

    if (value < 0 || value > 10) {
      errors[key] = 'Weight must be between 0 and 10';
    }
  });

  return errors;
}

/**
 * Check if feature weights are valid
 */
export function isValidFeatureWeights(weights: FeatureWeights): boolean {
  const errors = validateFeatureWeights(weights);
  return Object.keys(errors).length === 0;
}

/**
 * Get default feature weights
 */
export function getDefaultFeatureWeights(): FeatureWeights {
  return {
    avg_sat: 1,
    avg_act: 1,
    graduation_rate: 1,
    acceptance_rate: 1,
    student_faculty_ratio: 1,
    tuition_cost: 1,
    avg_aid: 1,
    student_population: 1,
    international_percentage: 1,
    latitude: 1,
    longitude: 1,
    ranking: 1
  };
}

/**
 * Get empty form data
 */
export function getEmptyFormData(): FormData {
  return {
    avg_sat: '',
    avg_act: '',
    graduation_rate: '',
    acceptance_rate: '',
    student_faculty_ratio: '',
    tuition_cost: '',
    avg_aid: '',
    student_population: '',
    international_percentage: '',
    latitude: '',
    longitude: '',
    ranking: ''
  };
}
