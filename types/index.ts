// School data structure from the dataset
export interface School {
  school_id: number;
  school_name: string;
  city?: string;
  state?: string;
  avg_sat: number;
  avg_act: number;
  graduation_rate: number;
  acceptance_rate: number;
  student_faculty_ratio: number;
  tuition_cost: number;
  avg_aid: number;
  student_population: number;
  international_percentage: number;
  latitude: number | null;
  longitude: number | null;
  ranking: number;
  type: string;
  urban_rural: string;
  website?: string;
}

// Student profile input from the form
export interface StudentProfile {
  avg_sat: number;
  avg_act: number;
  graduation_rate: number;
  acceptance_rate: number;
  student_faculty_ratio: number;
  tuition_cost: number;
  avg_aid: number;
  student_population: number;
  international_percentage: number;
  latitude: number | null;
  longitude: number | null;
  ranking: number;
}

// Feature weights for similarity computation
export interface FeatureWeights {
  avg_sat: number;
  avg_act: number;
  graduation_rate: number;
  acceptance_rate: number;
  student_faculty_ratio: number;
  tuition_cost: number;
  avg_aid: number;
  student_population: number;
  international_percentage: number;
  latitude: number;
  longitude: number;
  ranking: number;
  [key: string]: number;
}

// Result of similarity computation
export interface SimilarityResult {
  school: School;
  score: number;
}

// Statistics for a feature column
export interface FeatureStats {
  mean: number;
  std: number;
}

// Form data state (values can be empty strings before submission)
export interface FormData {
  avg_sat: number | '';
  avg_act: number | '';
  graduation_rate: number | '';
  acceptance_rate: number | '';
  student_faculty_ratio: number | '';
  tuition_cost: number | '';
  avg_aid: number | '';
  student_population: number | '';
  international_percentage: number | '';
  latitude: number | '';
  longitude: number | '';
  ranking: number | '';
}

// Validation error messages
export interface ValidationErrors {
  avg_sat?: string;
  avg_act?: string;
  graduation_rate?: string;
  acceptance_rate?: string;
  student_faculty_ratio?: string;
  tuition_cost?: string;
  avg_aid?: string;
  student_population?: string;
  international_percentage?: string;
  latitude?: string;
  longitude?: string;
  ranking?: string;
  [key: string]: string | undefined;
}

// Feature keys for iteration
export type FeatureKey = keyof StudentProfile;

// Feature labels for display
export type FeatureLabels = Record<FeatureKey, string>;

// API response types
export interface SimilarityApiRequest {
  profile: StudentProfile;
  weights?: FeatureWeights;
  topN?: number;
}

export interface SimilarityApiResponse {
  results: SimilarityResult[];
  computedAt: string;
  count: number;
}

export interface SchoolsApiResponse {
  schools: School[];
  count: number;
}

export interface ApiError {
  error: string;
  details?: ValidationErrors;
}
