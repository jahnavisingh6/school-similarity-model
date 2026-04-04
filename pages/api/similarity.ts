import type { NextApiRequest, NextApiResponse } from 'next';
import type {
  School,
  SimilarityApiRequest,
  SimilarityApiResponse,
  ApiError,
  GoalMatchResult
} from '../../types';
import { computeSimilarities } from '../../utils/similarity';
import { validateStudentProfile, validateFeatureWeights } from '../../utils/validation';
import { promises as fs } from 'fs';
import path from 'path';

// Cache for schools data
let schoolsCache: School[] | null = null;

async function loadSchools(): Promise<School[]> {
  if (schoolsCache) {
    return schoolsCache;
  }

  const filePath = path.join(process.cwd(), 'public', 'data', 'schools.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  schoolsCache = JSON.parse(fileContents) as School[];
  return schoolsCache;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimilarityApiResponse | ApiError>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const body = req.body as SimilarityApiRequest;

    // Validate request body
    if (!body.profile) {
      return res.status(400).json({ error: 'Missing required field: profile' });
    }

    // Validate student profile
    const profileErrors = validateStudentProfile(body.profile);
    if (Object.keys(profileErrors).length > 0) {
      console.log('Profile validation errors:', profileErrors);
      console.log('Received profile:', body.profile);
      return res.status(400).json({
        error: 'Invalid student profile',
        details: profileErrors
      });
    }

    // Validate feature weights if provided
    if (body.weights) {
      const weightErrors = validateFeatureWeights(body.weights);
      if (Object.keys(weightErrors).length > 0) {
        return res.status(400).json({
          error: 'Invalid feature weights',
          details: weightErrors
        });
      }
    }

    // Validate topN
    const topN = body.topN ?? 5;
    if (topN < 1 || topN > 20) {
      return res.status(400).json({ error: 'topN must be between 1 and 20' });
    }

    const goalSchoolIds = body.goalSchoolIds ?? [];
    if (!Array.isArray(goalSchoolIds) || goalSchoolIds.some(id => !Number.isInteger(id))) {
      return res.status(400).json({ error: 'goalSchoolIds must be an array of school IDs' });
    }

    if (goalSchoolIds.length > 5) {
      return res.status(400).json({ error: 'You can select up to 5 goal schools' });
    }

    // Load schools and compute similarities once so top matches and goal matches use the same scale
    const schools = await loadSchools();
    const similarities = computeSimilarities(
      body.profile,
      schools,
      body.weights ?? null
    );
    const results = similarities.slice(0, topN);

    const similarityBySchoolId = new Map(
      similarities.map((result, index) => [result.school.school_id, { ...result, rank: index + 1 }])
    );

    const goalMatches = goalSchoolIds.reduce<GoalMatchResult[]>((matches, id) => {
      const match = similarityBySchoolId.get(id);
      if (match) {
        matches.push(match);
      }
      return matches;
    }, []);

    return res.status(200).json({
      results,
      goalMatches,
      computedAt: new Date().toISOString(),
      count: results.length
    });
  } catch (error) {
    console.error('Error computing similarities:', error);
    return res.status(500).json({ error: 'Failed to compute similarities' });
  }
}
