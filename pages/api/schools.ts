import type { NextApiRequest, NextApiResponse } from 'next';
import type { School, SchoolsApiResponse, ApiError } from '../../types';
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
  res: NextApiResponse<SchoolsApiResponse | ApiError>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const schools = await loadSchools();

    return res.status(200).json({
      schools,
      count: schools.length
    });
  } catch (error) {
    console.error('Error loading schools:', error);
    return res.status(500).json({ error: 'Failed to load schools data' });
  }
}
