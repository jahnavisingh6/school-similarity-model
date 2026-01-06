import {
  standardize,
  computeStats,
  scaleValue,
  cosineSimilarity,
  computeSimilarities,
  getTopSimilarSchools,
  FEATURE_KEYS
} from './similarity';
import type { School, StudentProfile, FeatureWeights } from '../types';

// Mock school data for testing
const mockSchools: School[] = [
  {
    school_id: 1,
    school_name: 'Test University A',
    avg_sat: 1400,
    avg_act: 32,
    graduation_rate: 90,
    acceptance_rate: 20,
    student_faculty_ratio: 10,
    tuition_cost: 50000,
    avg_aid: 25000,
    student_population: 15000,
    international_percentage: 15,
    latitude: 40.7128,
    longitude: -74.006,
    ranking: 10,
    type: 'Private',
    urban_rural: 'Urban'
  },
  {
    school_id: 2,
    school_name: 'Test University B',
    avg_sat: 1200,
    avg_act: 26,
    graduation_rate: 75,
    acceptance_rate: 50,
    student_faculty_ratio: 18,
    tuition_cost: 30000,
    avg_aid: 15000,
    student_population: 25000,
    international_percentage: 8,
    latitude: 34.0522,
    longitude: -118.2437,
    ranking: 50,
    type: 'Public',
    urban_rural: 'Suburban'
  },
  {
    school_id: 3,
    school_name: 'Test University C',
    avg_sat: 1300,
    avg_act: 29,
    graduation_rate: 82,
    acceptance_rate: 35,
    student_faculty_ratio: 14,
    tuition_cost: 40000,
    avg_aid: 20000,
    student_population: 20000,
    international_percentage: 12,
    latitude: 41.8781,
    longitude: -87.6298,
    ranking: 30,
    type: 'Private',
    urban_rural: 'Urban'
  }
];

describe('standardize', () => {
  it('should return empty array for empty input', () => {
    expect(standardize([])).toEqual([]);
  });

  it('should return zeros when all values are the same', () => {
    expect(standardize([5, 5, 5, 5])).toEqual([0, 0, 0, 0]);
  });

  it('should normalize values with mean 0 and std 1', () => {
    const result = standardize([1, 2, 3, 4, 5]);
    const mean = result.reduce((a, b) => a + b, 0) / result.length;
    const variance = result.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / result.length;
    const std = Math.sqrt(variance);

    expect(mean).toBeCloseTo(0, 10);
    expect(std).toBeCloseTo(1, 10);
  });

  it('should handle negative values', () => {
    const result = standardize([-10, 0, 10]);
    expect(result[0]).toBeLessThan(0);
    expect(result[1]).toBeCloseTo(0);
    expect(result[2]).toBeGreaterThan(0);
  });
});

describe('computeStats', () => {
  it('should compute mean and std correctly', () => {
    const stats = computeStats(mockSchools, 'avg_sat');
    expect(stats.mean).toBeCloseTo(1300, 0);
    expect(stats.std).toBeGreaterThan(0);
  });

  it('should return default values for empty array', () => {
    const stats = computeStats([], 'avg_sat');
    expect(stats).toEqual({ mean: 0, std: 1 });
  });

  it('should handle null values gracefully', () => {
    const schoolsWithNull: School[] = [
      { ...mockSchools[0], latitude: null },
      { ...mockSchools[1], latitude: null },
      { ...mockSchools[2] }
    ];
    const stats = computeStats(schoolsWithNull, 'latitude');
    expect(stats.mean).toBe(mockSchools[2].latitude);
    expect(stats.std).toBe(1); // Single value, std would be 0, defaulted to 1
  });

  it('should return std of 1 when all values are identical', () => {
    const identicalSchools = mockSchools.map(s => ({ ...s, ranking: 50 }));
    const stats = computeStats(identicalSchools, 'ranking');
    expect(stats.std).toBe(1);
  });
});

describe('scaleValue', () => {
  const stats = { mean: 100, std: 20 };

  it('should scale value correctly using z-score formula', () => {
    expect(scaleValue(120, stats)).toBe(1);
    expect(scaleValue(80, stats)).toBe(-1);
    expect(scaleValue(100, stats)).toBe(0);
  });

  it('should return 0 for null value', () => {
    expect(scaleValue(null, stats)).toBe(0);
  });

  it('should return 0 for undefined value', () => {
    expect(scaleValue(undefined, stats)).toBe(0);
  });

  it('should return 0 for NaN value', () => {
    expect(scaleValue(NaN, stats)).toBe(0);
  });
});

describe('cosineSimilarity', () => {
  it('should return 1 for identical vectors', () => {
    const vec = [1, 2, 3, 4, 5];
    expect(cosineSimilarity(vec, vec)).toBeCloseTo(1);
  });

  it('should return 1 for proportional vectors', () => {
    const vecA = [1, 2, 3];
    const vecB = [2, 4, 6];
    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1);
  });

  it('should return 0 for orthogonal vectors', () => {
    const vecA = [1, 0, 0];
    const vecB = [0, 1, 0];
    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(0);
  });

  it('should return -1 for opposite vectors', () => {
    const vecA = [1, 2, 3];
    const vecB = [-1, -2, -3];
    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(-1);
  });

  it('should return 0 when either vector is zero', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
    expect(cosineSimilarity([1, 2, 3], [0, 0, 0])).toBe(0);
  });

  it('should return 0 for empty vectors', () => {
    expect(cosineSimilarity([], [])).toBe(0);
  });

  it('should throw error for vectors of different lengths', () => {
    expect(() => cosineSimilarity([1, 2], [1, 2, 3])).toThrow('Vectors must have the same length');
  });
});

describe('computeSimilarities', () => {
  it('should return results for all schools', () => {
    const studentProfile: StudentProfile = {
      avg_sat: 1350,
      avg_act: 30,
      graduation_rate: 85,
      acceptance_rate: 30,
      student_faculty_ratio: 12,
      tuition_cost: 45000,
      avg_aid: 22000,
      student_population: 18000,
      international_percentage: 13,
      latitude: 41.0,
      longitude: -80.0,
      ranking: 20
    };

    const results = computeSimilarities(studentProfile, mockSchools);

    expect(results).toHaveLength(3);
    results.forEach(result => {
      expect(result).toHaveProperty('school');
      expect(result).toHaveProperty('score');
      expect(typeof result.score).toBe('number');
    });
  });

  it('should sort results by similarity score in descending order', () => {
    const studentProfile: StudentProfile = {
      avg_sat: 1400,
      avg_act: 32,
      graduation_rate: 90,
      acceptance_rate: 20,
      student_faculty_ratio: 10,
      tuition_cost: 50000,
      avg_aid: 25000,
      student_population: 15000,
      international_percentage: 15,
      latitude: 40.7128,
      longitude: -74.006,
      ranking: 10
    };

    const results = computeSimilarities(studentProfile, mockSchools);

    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
    }
  });

  it('should return highest similarity for matching school profile', () => {
    // Student profile that exactly matches school A
    const studentProfile: StudentProfile = {
      avg_sat: mockSchools[0].avg_sat,
      avg_act: mockSchools[0].avg_act,
      graduation_rate: mockSchools[0].graduation_rate,
      acceptance_rate: mockSchools[0].acceptance_rate,
      student_faculty_ratio: mockSchools[0].student_faculty_ratio,
      tuition_cost: mockSchools[0].tuition_cost,
      avg_aid: mockSchools[0].avg_aid,
      student_population: mockSchools[0].student_population,
      international_percentage: mockSchools[0].international_percentage,
      latitude: mockSchools[0].latitude,
      longitude: mockSchools[0].longitude,
      ranking: mockSchools[0].ranking
    };

    const results = computeSimilarities(studentProfile, mockSchools);

    expect(results[0].school.school_id).toBe(1);
    expect(results[0].score).toBeCloseTo(1, 5);
  });

  it('should apply feature weights correctly', () => {
    const studentProfile: StudentProfile = {
      avg_sat: 1400,
      avg_act: 26, // Matches school B
      graduation_rate: 85,
      acceptance_rate: 30,
      student_faculty_ratio: 12,
      tuition_cost: 45000,
      avg_aid: 22000,
      student_population: 18000,
      international_percentage: 13,
      latitude: 41.0,
      longitude: -80.0,
      ranking: 20
    };

    // Heavy weight on ACT
    const weights: FeatureWeights = {
      avg_sat: 0.1,
      avg_act: 10, // Very high weight
      graduation_rate: 0.1,
      acceptance_rate: 0.1,
      student_faculty_ratio: 0.1,
      tuition_cost: 0.1,
      avg_aid: 0.1,
      student_population: 0.1,
      international_percentage: 0.1,
      latitude: 0.1,
      longitude: 0.1,
      ranking: 0.1
    };

    const resultsNoWeight = computeSimilarities(studentProfile, mockSchools);
    const resultsWithWeight = computeSimilarities(studentProfile, mockSchools, weights);

    // Results should be different when weights are applied
    expect(resultsNoWeight[0].score).not.toBeCloseTo(resultsWithWeight[0].score, 3);
  });

  it('should handle null feature weights', () => {
    const studentProfile: StudentProfile = {
      avg_sat: 1350,
      avg_act: 30,
      graduation_rate: 85,
      acceptance_rate: 30,
      student_faculty_ratio: 12,
      tuition_cost: 45000,
      avg_aid: 22000,
      student_population: 18000,
      international_percentage: 13,
      latitude: 41.0,
      longitude: -80.0,
      ranking: 20
    };

    expect(() => computeSimilarities(studentProfile, mockSchools, null)).not.toThrow();
  });
});

describe('getTopSimilarSchools', () => {
  const studentProfile: StudentProfile = {
    avg_sat: 1350,
    avg_act: 30,
    graduation_rate: 85,
    acceptance_rate: 30,
    student_faculty_ratio: 12,
    tuition_cost: 45000,
    avg_aid: 22000,
    student_population: 18000,
    international_percentage: 13,
    latitude: 41.0,
    longitude: -80.0,
    ranking: 20
  };

  it('should return default of 5 schools (or all if less)', () => {
    const results = getTopSimilarSchools(studentProfile, mockSchools);
    expect(results.length).toBe(3); // Only 3 mock schools
  });

  it('should return specified number of top schools', () => {
    const results = getTopSimilarSchools(studentProfile, mockSchools, 2);
    expect(results.length).toBe(2);
  });

  it('should return all schools if topN exceeds array length', () => {
    const results = getTopSimilarSchools(studentProfile, mockSchools, 100);
    expect(results.length).toBe(3);
  });

  it('should return empty array for empty schools list', () => {
    const results = getTopSimilarSchools(studentProfile, []);
    expect(results).toEqual([]);
  });

  it('should pass feature weights to computeSimilarities', () => {
    const weights: FeatureWeights = {
      avg_sat: 2,
      avg_act: 2,
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

    const resultsNoWeight = getTopSimilarSchools(studentProfile, mockSchools, 5);
    const resultsWithWeight = getTopSimilarSchools(studentProfile, mockSchools, 5, weights);

    // Scores should differ with weights
    expect(resultsNoWeight[0].score).not.toEqual(resultsWithWeight[0].score);
  });
});

describe('FEATURE_KEYS', () => {
  it('should contain all 12 feature keys', () => {
    expect(FEATURE_KEYS).toHaveLength(12);
  });

  it('should contain expected keys', () => {
    expect(FEATURE_KEYS).toContain('avg_sat');
    expect(FEATURE_KEYS).toContain('avg_act');
    expect(FEATURE_KEYS).toContain('graduation_rate');
    expect(FEATURE_KEYS).toContain('latitude');
    expect(FEATURE_KEYS).toContain('longitude');
    expect(FEATURE_KEYS).toContain('ranking');
  });
});
