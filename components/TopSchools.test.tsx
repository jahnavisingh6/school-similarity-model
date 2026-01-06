import { render, screen } from '@testing-library/react';
import TopSchools from './TopSchools';
import type { SimilarityResult } from '../types';

// Mock CSS module
jest.mock('../styles/TopSchools.module.css', () => ({
  container: 'container',
  title: 'title',
  resultsGrid: 'resultsGrid',
  schoolCard: 'schoolCard',
  rankBadge: 'rankBadge',
  similarityScore: 'similarityScore',
  schoolName: 'schoolName',
  schoolDetails: 'schoolDetails',
  detailRow: 'detailRow',
  detailLabel: 'detailLabel',
  detailValue: 'detailValue'
}));

describe('TopSchools', () => {
  const mockResults: SimilarityResult[] = [
    {
      school: {
        school_id: 1,
        school_name: 'Test University A',
        city: 'Phoenix',
        state: 'AZ',
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
        urban_rural: 'Urban',
        website: 'https://example.edu'
      },
      score: 0.95
    },
    {
      school: {
        school_id: 2,
        school_name: 'Test University B',
        city: 'Los Angeles',
        state: 'CA',
        avg_sat: 1200,
        avg_act: 26,
        graduation_rate: 75,
        acceptance_rate: 50,
        student_faculty_ratio: 18,
        tuition_cost: 30000,
        avg_aid: 15000,
        student_population: 25000,
        international_percentage: 8,
        latitude: null,
        longitude: null,
        ranking: 50,
        type: 'Public',
        urban_rural: 'Suburban'
      },
      score: 0.82
    }
  ];

  describe('Rendering', () => {
    it('should return null when results are empty', () => {
      const { container } = render(<TopSchools results={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('should return null when results are undefined', () => {
      const { container } = render(<TopSchools results={undefined as any} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render the title with correct count', () => {
      render(<TopSchools results={mockResults} />);
      expect(screen.getByText(/Top 2 Most Similar Schools/i)).toBeInTheDocument();
    });

    it('should render all result cards', () => {
      render(<TopSchools results={mockResults} />);
      expect(screen.getByText('Test University A')).toBeInTheDocument();
      expect(screen.getByText('Test University B')).toBeInTheDocument();
    });

    it('should display rank badges correctly', () => {
      render(<TopSchools results={mockResults} />);
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
    });

    it('should display similarity scores as percentages', () => {
      render(<TopSchools results={mockResults} />);
      expect(screen.getByText('95.0% match')).toBeInTheDocument();
      expect(screen.getByText('82.0% match')).toBeInTheDocument();
    });
  });

  describe('Data Formatting', () => {
    it('should format currency values correctly', () => {
      render(<TopSchools results={mockResults} />);
      expect(screen.getByText('$50,000')).toBeInTheDocument();
      expect(screen.getByText('$25,000')).toBeInTheDocument();
    });

    it('should format percentage values correctly', () => {
      render(<TopSchools results={mockResults} />);
      expect(screen.getByText('90.0%')).toBeInTheDocument();
      expect(screen.getByText('20.0%')).toBeInTheDocument();
    });

    it('should format population numbers with commas', () => {
      render(<TopSchools results={mockResults} />);
      expect(screen.getByText('15,000')).toBeInTheDocument();
      expect(screen.getByText('25,000')).toBeInTheDocument();
    });

    it('should display school type', () => {
      render(<TopSchools results={mockResults} />);
      expect(screen.getByText('Private')).toBeInTheDocument();
      expect(screen.getByText('Public')).toBeInTheDocument();
    });

    it('should display urban/rural setting', () => {
      render(<TopSchools results={mockResults} />);
      expect(screen.getByText('Urban')).toBeInTheDocument();
      expect(screen.getByText('Suburban')).toBeInTheDocument();
    });
  });

  describe('Location Display', () => {
    it('should display city and state when available', () => {
      render(<TopSchools results={mockResults} />);
      expect(screen.getByText('Phoenix, AZ')).toBeInTheDocument();
    });

    it('should display location for all schools with city/state', () => {
      render(<TopSchools results={mockResults} />);
      const locationLabels = screen.getAllByText('Location:');
      expect(locationLabels.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single result', () => {
      render(<TopSchools results={[mockResults[0]]} />);
      expect(screen.getByText(/Top 1 Most Similar Schools/i)).toBeInTheDocument();
      expect(screen.getByText('Test University A')).toBeInTheDocument();
    });

    it('should handle school with missing school_id using index', () => {
      const resultWithoutId: SimilarityResult[] = [{
        school: {
          ...mockResults[0].school,
          school_id: undefined as any
        },
        score: 0.9
      }];

      render(<TopSchools results={resultWithoutId} />);
      expect(screen.getByText('Test University A')).toBeInTheDocument();
    });
  });
});
