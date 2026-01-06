/**
 * Utility functions for computing similarity between student profile and schools
 */

import type { School, StudentProfile, FeatureWeights, SimilarityResult, FeatureStats, FeatureKey } from '../types';

// Define feature keys (excluding non-numeric fields)
export const FEATURE_KEYS: FeatureKey[] = [
  'avg_sat',
  'avg_act',
  'graduation_rate',
  'acceptance_rate',
  'student_faculty_ratio',
  'tuition_cost',
  'avg_aid',
  'student_population',
  'international_percentage',
  'latitude',
  'longitude',
  'ranking'
];

/**
 * Standardize (Z-score normalization) an array
 * Formula: (x - mean) / std
 */
export function standardize(values: number[]): number[] {
  if (values.length === 0) return [];

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);

  if (std === 0) return values.map(() => 0);

  return values.map(val => (val - mean) / std);
}

/**
 * Compute mean and std for a feature column across all schools
 */
export function computeStats(schools: School[], featureKey: FeatureKey): FeatureStats {
  const values = schools
    .map(school => school[featureKey] as number | null)
    .filter((v): v is number => v != null && !isNaN(v));

  if (values.length === 0) return { mean: 0, std: 1 };

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);

  return { mean, std: std === 0 ? 1 : std };
}

/**
 * Scale a single value using precomputed stats
 */
export function scaleValue(value: number | null | undefined, stats: FeatureStats): number {
  if (value == null || isNaN(value)) return 0;
  return (value - stats.mean) / stats.std;
}

/**
 * Compute cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  if (vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (normA * normB);
}

/**
 * Compute similarity scores for a student profile against all schools
 * @param studentProfile - Student input profile
 * @param schools - Array of school objects
 * @param featureWeights - Optional weights for each feature
 * @returns Array of {school, score} objects sorted by similarity (descending)
 */
export function computeSimilarities(
  studentProfile: StudentProfile,
  schools: School[],
  featureWeights: FeatureWeights | null = null
): SimilarityResult[] {
  // Compute statistics for scaling (using all schools)
  const stats: Record<FeatureKey, FeatureStats> = {} as Record<FeatureKey, FeatureStats>;
  FEATURE_KEYS.forEach(key => {
    stats[key] = computeStats(schools, key);
  });

  // Scale student profile features
  const studentVector = FEATURE_KEYS.map(key => {
    const value = studentProfile[key];
    return scaleValue(value, stats[key]);
  });

  // Apply weights if provided
  if (featureWeights) {
    FEATURE_KEYS.forEach((key, idx) => {
      const weight = featureWeights[key] ?? 1;
      studentVector[idx] *= weight;
    });
  }

  // Compute similarity for each school
  const similarities: SimilarityResult[] = schools.map(school => {
    // Extract and scale school features
    const schoolVector = FEATURE_KEYS.map(key => {
      const value = school[key] as number | null;
      return scaleValue(value, stats[key]);
    });

    // Apply same weights if provided
    if (featureWeights) {
      FEATURE_KEYS.forEach((key, idx) => {
        const weight = featureWeights[key] ?? 1;
        schoolVector[idx] *= weight;
      });
    }

    // Compute cosine similarity
    const score = cosineSimilarity(studentVector, schoolVector);

    return {
      school,
      score
    };
  });

  // Sort by similarity score (descending)
  similarities.sort((a, b) => b.score - a.score);

  return similarities;
}

/**
 * Get top N most similar schools
 */
export function getTopSimilarSchools(
  studentProfile: StudentProfile,
  schools: School[],
  topN: number = 5,
  featureWeights: FeatureWeights | null = null
): SimilarityResult[] {
  const similarities = computeSimilarities(studentProfile, schools, featureWeights);
  return similarities.slice(0, topN);
}
