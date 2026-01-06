import {
  validateField,
  validateFormData,
  validateStudentProfile,
  isValidFormData,
  isValidProfile,
  validateFeatureWeights,
  isValidFeatureWeights,
  getDefaultFeatureWeights,
  getEmptyFormData,
  VALIDATION_RULES
} from './validation';
import type { StudentProfile, FormData, FeatureWeights } from '../types';

describe('VALIDATION_RULES', () => {
  it('should have rules for all 12 features', () => {
    expect(Object.keys(VALIDATION_RULES)).toHaveLength(12);
  });

  it('should have correct SAT range', () => {
    expect(VALIDATION_RULES.avg_sat.min).toBe(400);
    expect(VALIDATION_RULES.avg_sat.max).toBe(1600);
    expect(VALIDATION_RULES.avg_sat.required).toBe(true);
  });

  it('should have correct ACT range', () => {
    expect(VALIDATION_RULES.avg_act.min).toBe(1);
    expect(VALIDATION_RULES.avg_act.max).toBe(36);
  });

  it('should mark latitude and longitude as optional', () => {
    expect(VALIDATION_RULES.latitude.required).toBe(false);
    expect(VALIDATION_RULES.longitude.required).toBe(false);
  });
});

describe('validateField', () => {
  describe('required fields', () => {
    it('should return error for empty required field', () => {
      expect(validateField('avg_sat', '')).toBe('SAT Score is required');
      expect(validateField('avg_sat', null)).toBe('SAT Score is required');
      expect(validateField('avg_sat', undefined)).toBe('SAT Score is required');
    });

    it('should return undefined for valid required field', () => {
      expect(validateField('avg_sat', 1200)).toBeUndefined();
    });
  });

  describe('optional fields', () => {
    it('should return undefined for empty optional field', () => {
      expect(validateField('latitude', '')).toBeUndefined();
      expect(validateField('latitude', null)).toBeUndefined();
      expect(validateField('longitude', undefined)).toBeUndefined();
    });
  });

  describe('range validation', () => {
    it('should return error for value below minimum', () => {
      expect(validateField('avg_sat', 300)).toBe('SAT Score must be between 400 and 1600');
      expect(validateField('avg_act', 0)).toBe('ACT Score must be between 1 and 36');
    });

    it('should return error for value above maximum', () => {
      expect(validateField('avg_sat', 1700)).toBe('SAT Score must be between 400 and 1600');
      expect(validateField('avg_act', 40)).toBe('ACT Score must be between 1 and 36');
    });

    it('should accept boundary values', () => {
      expect(validateField('avg_sat', 400)).toBeUndefined();
      expect(validateField('avg_sat', 1600)).toBeUndefined();
      expect(validateField('graduation_rate', 0)).toBeUndefined();
      expect(validateField('graduation_rate', 100)).toBeUndefined();
    });
  });

  describe('percentage fields', () => {
    it('should validate graduation_rate 0-100', () => {
      expect(validateField('graduation_rate', -1)).toContain('between 0 and 100');
      expect(validateField('graduation_rate', 101)).toContain('between 0 and 100');
      expect(validateField('graduation_rate', 50)).toBeUndefined();
    });

    it('should validate acceptance_rate 0-100', () => {
      expect(validateField('acceptance_rate', 50)).toBeUndefined();
    });

    it('should validate international_percentage 0-100', () => {
      expect(validateField('international_percentage', 15)).toBeUndefined();
    });
  });

  describe('geographic fields', () => {
    it('should validate latitude -90 to 90', () => {
      expect(validateField('latitude', -91)).toContain('between -90 and 90');
      expect(validateField('latitude', 91)).toContain('between -90 and 90');
      expect(validateField('latitude', 40.7128)).toBeUndefined();
    });

    it('should validate longitude -180 to 180', () => {
      expect(validateField('longitude', -181)).toContain('between -180 and 180');
      expect(validateField('longitude', 181)).toContain('between -180 and 180');
      expect(validateField('longitude', -74.006)).toBeUndefined();
    });
  });
});

describe('validateFormData', () => {
  it('should return empty object for valid form data', () => {
    const validData: FormData = {
      avg_sat: 1200,
      avg_act: 28,
      graduation_rate: 85,
      acceptance_rate: 30,
      student_faculty_ratio: 12,
      tuition_cost: 40000,
      avg_aid: 20000,
      student_population: 15000,
      international_percentage: 10,
      latitude: 40.7,
      longitude: -74.0,
      ranking: 50
    };

    expect(validateFormData(validData)).toEqual({});
  });

  it('should return errors for multiple invalid fields', () => {
    const invalidData: FormData = {
      avg_sat: 300, // Too low
      avg_act: 40, // Too high
      graduation_rate: '',
      acceptance_rate: 30,
      student_faculty_ratio: 12,
      tuition_cost: 40000,
      avg_aid: 20000,
      student_population: 15000,
      international_percentage: 10,
      latitude: '',
      longitude: '',
      ranking: 50
    };

    const errors = validateFormData(invalidData);
    expect(errors.avg_sat).toBeDefined();
    expect(errors.avg_act).toBeDefined();
    expect(errors.graduation_rate).toBeDefined();
    expect(errors.latitude).toBeUndefined(); // Optional
    expect(errors.longitude).toBeUndefined(); // Optional
  });

  it('should accept optional fields as empty', () => {
    const dataWithEmptyOptional: FormData = {
      avg_sat: 1200,
      avg_act: 28,
      graduation_rate: 85,
      acceptance_rate: 30,
      student_faculty_ratio: 12,
      tuition_cost: 40000,
      avg_aid: 20000,
      student_population: 15000,
      international_percentage: 10,
      latitude: '', // Optional
      longitude: '', // Optional
      ranking: 50
    };

    const errors = validateFormData(dataWithEmptyOptional);
    expect(errors.latitude).toBeUndefined();
    expect(errors.longitude).toBeUndefined();
  });
});

describe('validateStudentProfile', () => {
  it('should return empty object for valid profile', () => {
    const validProfile: StudentProfile = {
      avg_sat: 1200,
      avg_act: 28,
      graduation_rate: 85,
      acceptance_rate: 30,
      student_faculty_ratio: 12,
      tuition_cost: 40000,
      avg_aid: 20000,
      student_population: 15000,
      international_percentage: 10,
      latitude: 40.7,
      longitude: -74.0,
      ranking: 50
    };

    expect(validateStudentProfile(validProfile)).toEqual({});
  });

  it('should accept null for optional fields', () => {
    const profileWithNull: StudentProfile = {
      avg_sat: 1200,
      avg_act: 28,
      graduation_rate: 85,
      acceptance_rate: 30,
      student_faculty_ratio: 12,
      tuition_cost: 40000,
      avg_aid: 20000,
      student_population: 15000,
      international_percentage: 10,
      latitude: null,
      longitude: null,
      ranking: 50
    };

    const errors = validateStudentProfile(profileWithNull);
    expect(errors.latitude).toBeUndefined();
    expect(errors.longitude).toBeUndefined();
  });

  it('should return errors for out-of-range values', () => {
    const invalidProfile: StudentProfile = {
      avg_sat: 2000, // Too high
      avg_act: 28,
      graduation_rate: 85,
      acceptance_rate: 30,
      student_faculty_ratio: 12,
      tuition_cost: 40000,
      avg_aid: 20000,
      student_population: 15000,
      international_percentage: 10,
      latitude: null,
      longitude: null,
      ranking: 50
    };

    const errors = validateStudentProfile(invalidProfile);
    expect(errors.avg_sat).toContain('between 400 and 1600');
  });
});

describe('isValidFormData', () => {
  it('should return true for valid form data', () => {
    const validData: FormData = {
      avg_sat: 1200,
      avg_act: 28,
      graduation_rate: 85,
      acceptance_rate: 30,
      student_faculty_ratio: 12,
      tuition_cost: 40000,
      avg_aid: 20000,
      student_population: 15000,
      international_percentage: 10,
      latitude: 40.7,
      longitude: -74.0,
      ranking: 50
    };

    expect(isValidFormData(validData)).toBe(true);
  });

  it('should return false for invalid form data', () => {
    const invalidData: FormData = {
      avg_sat: '',
      avg_act: 28,
      graduation_rate: 85,
      acceptance_rate: 30,
      student_faculty_ratio: 12,
      tuition_cost: 40000,
      avg_aid: 20000,
      student_population: 15000,
      international_percentage: 10,
      latitude: '',
      longitude: '',
      ranking: 50
    };

    expect(isValidFormData(invalidData)).toBe(false);
  });
});

describe('isValidProfile', () => {
  it('should return true for valid profile', () => {
    const validProfile: StudentProfile = {
      avg_sat: 1200,
      avg_act: 28,
      graduation_rate: 85,
      acceptance_rate: 30,
      student_faculty_ratio: 12,
      tuition_cost: 40000,
      avg_aid: 20000,
      student_population: 15000,
      international_percentage: 10,
      latitude: null,
      longitude: null,
      ranking: 50
    };

    expect(isValidProfile(validProfile)).toBe(true);
  });

  it('should return false for invalid profile', () => {
    const invalidProfile: StudentProfile = {
      avg_sat: 300, // Too low
      avg_act: 28,
      graduation_rate: 85,
      acceptance_rate: 30,
      student_faculty_ratio: 12,
      tuition_cost: 40000,
      avg_aid: 20000,
      student_population: 15000,
      international_percentage: 10,
      latitude: null,
      longitude: null,
      ranking: 50
    };

    expect(isValidProfile(invalidProfile)).toBe(false);
  });
});

describe('validateFeatureWeights', () => {
  it('should return empty object for valid weights', () => {
    const weights = getDefaultFeatureWeights();
    expect(validateFeatureWeights(weights)).toEqual({});
  });

  it('should return errors for negative weights', () => {
    const weights: FeatureWeights = {
      ...getDefaultFeatureWeights(),
      avg_sat: -1
    };

    const errors = validateFeatureWeights(weights);
    expect(errors.avg_sat).toContain('between 0 and 10');
  });

  it('should return errors for weights above 10', () => {
    const weights: FeatureWeights = {
      ...getDefaultFeatureWeights(),
      avg_sat: 15
    };

    const errors = validateFeatureWeights(weights);
    expect(errors.avg_sat).toContain('between 0 and 10');
  });

  it('should accept boundary values 0 and 10', () => {
    const weights: FeatureWeights = {
      ...getDefaultFeatureWeights(),
      avg_sat: 0,
      avg_act: 10
    };

    expect(validateFeatureWeights(weights)).toEqual({});
  });
});

describe('isValidFeatureWeights', () => {
  it('should return true for valid weights', () => {
    expect(isValidFeatureWeights(getDefaultFeatureWeights())).toBe(true);
  });

  it('should return false for invalid weights', () => {
    const invalidWeights: FeatureWeights = {
      ...getDefaultFeatureWeights(),
      avg_sat: -5
    };
    expect(isValidFeatureWeights(invalidWeights)).toBe(false);
  });
});

describe('getDefaultFeatureWeights', () => {
  it('should return all weights set to 1', () => {
    const weights = getDefaultFeatureWeights();
    Object.values(weights).forEach(weight => {
      expect(weight).toBe(1);
    });
  });

  it('should return 12 feature weights', () => {
    const weights = getDefaultFeatureWeights();
    expect(Object.keys(weights)).toHaveLength(12);
  });
});

describe('getEmptyFormData', () => {
  it('should return all fields as empty strings', () => {
    const formData = getEmptyFormData();
    Object.values(formData).forEach(value => {
      expect(value).toBe('');
    });
  });

  it('should return 12 fields', () => {
    const formData = getEmptyFormData();
    expect(Object.keys(formData)).toHaveLength(12);
  });
});
