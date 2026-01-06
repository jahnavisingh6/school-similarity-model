/**
 * API utilities for fetching data from the backend
 */

import type {
  StudentProfile,
  FeatureWeights,
  SimilarityApiResponse,
  SchoolsApiResponse,
  ApiError
} from '../types';

const API_BASE = '/api';

/**
 * Custom error class for API errors
 */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: Record<string, string | undefined>
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Fetch all schools
 */
export async function fetchSchools(): Promise<SchoolsApiResponse> {
  const response = await fetch(`${API_BASE}/schools`);

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new ApiRequestError(
      error.error || 'Failed to fetch schools',
      response.status
    );
  }

  return response.json();
}

/**
 * Compute similarity scores for a student profile
 */
export async function computeSimilarity(
  profile: StudentProfile,
  weights?: FeatureWeights,
  topN?: number
): Promise<SimilarityApiResponse> {
  const response = await fetch(`${API_BASE}/similarity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      profile,
      weights,
      topN
    })
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new ApiRequestError(
      error.error || 'Failed to compute similarity',
      response.status,
      error.details
    );
  }

  return response.json();
}
