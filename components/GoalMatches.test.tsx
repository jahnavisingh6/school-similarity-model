import { render, screen } from '@testing-library/react';
import GoalMatches from './GoalMatches';
import type { GoalMatchResult } from '../types';

jest.mock('../styles/GoalMatches.module.css', () => ({
  container: 'container',
  header: 'header',
  title: 'title',
  description: 'description',
  grid: 'grid',
  card: 'card',
  score: 'score',
  schoolName: 'schoolName',
  meta: 'meta',
  rank: 'rank'
}));

describe('GoalMatches', () => {
  const matches: GoalMatchResult[] = [
    {
      school: {
        school_id: 7,
        school_name: 'Dream University',
        city: 'Boston',
        state: 'MA',
        avg_sat: 1480,
        avg_act: 33,
        graduation_rate: 92,
        acceptance_rate: 8,
        student_faculty_ratio: 9,
        tuition_cost: 54000,
        avg_aid: 21000,
        student_population: 19000,
        international_percentage: 14,
        latitude: 42.3601,
        longitude: -71.0589,
        ranking: 11,
        type: 'Private',
        urban_rural: 'Urban'
      },
      score: 0.88,
      rank: 4
    }
  ];

  it('renders nothing when there are no matches', () => {
    const { container } = render(<GoalMatches matches={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders goal school closeness and rank', () => {
    render(<GoalMatches matches={matches} />);

    expect(screen.getByText('Your Goal School Fit')).toBeInTheDocument();
    expect(screen.getByText('Dream University')).toBeInTheDocument();
    expect(screen.getByText('88.0% close')).toBeInTheDocument();
    expect(screen.getByText(/Overall similarity rank: #4/i)).toBeInTheDocument();
  });
});
