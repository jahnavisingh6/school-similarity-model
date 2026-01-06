import { render, screen, fireEvent } from '@testing-library/react';
import Filters, { applyFilters, DEFAULT_FILTERS, FilterState } from './Filters';
import type { School } from '../types';

const mockSchools: School[] = [
  {
    school_id: 1,
    school_name: 'MIT',
    avg_sat: 1540,
    avg_act: 35,
    graduation_rate: 94,
    acceptance_rate: 7,
    student_faculty_ratio: 3,
    tuition_cost: 55000,
    avg_aid: 40000,
    student_population: 11000,
    international_percentage: 10,
    latitude: 42.36,
    longitude: -71.09,
    ranking: 1,
    type: 'Private',
    urban_rural: 'City',
    state: 'MA',
    city: 'Cambridge',
    website: 'www.mit.edu',
  },
  {
    school_id: 2,
    school_name: 'UC Berkeley',
    avg_sat: 1440,
    avg_act: 33,
    graduation_rate: 91,
    acceptance_rate: 17,
    student_faculty_ratio: 20,
    tuition_cost: 15000,
    avg_aid: 12000,
    student_population: 45000,
    international_percentage: 15,
    latitude: 37.87,
    longitude: -122.26,
    ranking: 20,
    type: 'Public',
    urban_rural: 'City',
    state: 'CA',
    city: 'Berkeley',
    website: 'www.berkeley.edu',
  },
  {
    school_id: 3,
    school_name: 'University of Texas',
    avg_sat: 1280,
    avg_act: 28,
    graduation_rate: 85,
    acceptance_rate: 32,
    student_faculty_ratio: 18,
    tuition_cost: 12000,
    avg_aid: 8000,
    student_population: 52000,
    international_percentage: 8,
    latitude: 30.28,
    longitude: -97.74,
    ranking: 42,
    type: 'Public',
    urban_rural: 'City',
    state: 'TX',
    city: 'Austin',
    website: 'www.utexas.edu',
  },
];

describe('applyFilters', () => {
  it('should return all schools with default filters', () => {
    const result = applyFilters(mockSchools, DEFAULT_FILTERS);
    expect(result).toHaveLength(3);
  });

  it('should filter by state', () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      states: ['CA'],
    };
    const result = applyFilters(mockSchools, filters);
    expect(result).toHaveLength(1);
    expect(result[0].state).toBe('CA');
  });

  it('should filter by multiple states', () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      states: ['CA', 'TX'],
    };
    const result = applyFilters(mockSchools, filters);
    expect(result).toHaveLength(2);
  });

  it('should filter by school type', () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      schoolTypes: ['Private'],
    };
    const result = applyFilters(mockSchools, filters);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('Private');
  });

  it('should filter by tuition range', () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      tuitionMin: 10000,
      tuitionMax: 20000,
    };
    const result = applyFilters(mockSchools, filters);
    expect(result).toHaveLength(2);
    expect(result.every(s => s.tuition_cost >= 10000 && s.tuition_cost <= 20000)).toBe(true);
  });

  it('should filter by SAT range', () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      satMin: 1400,
      satMax: 1600,
    };
    const result = applyFilters(mockSchools, filters);
    expect(result).toHaveLength(2);
    expect(result.every(s => s.avg_sat >= 1400)).toBe(true);
  });

  it('should combine multiple filters', () => {
    const filters: FilterState = {
      states: [],
      schoolTypes: ['Public'],
      tuitionMin: 0,
      tuitionMax: 15000,
      satMin: 400,
      satMax: 1600,
    };
    const result = applyFilters(mockSchools, filters);
    expect(result).toHaveLength(2);
  });

  it('should return empty array when no schools match', () => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      states: ['NY'], // No schools from NY in mock data
    };
    const result = applyFilters(mockSchools, filters);
    expect(result).toHaveLength(0);
  });
});

describe('Filters Component', () => {
  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    mockOnFiltersChange.mockClear();
  });

  it('should render the filter toggle button', () => {
    render(
      <Filters
        schools={mockSchools}
        filters={DEFAULT_FILTERS}
        onFiltersChange={mockOnFiltersChange}
      />
    );
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('should expand filter panel when toggle is clicked', () => {
    render(
      <Filters
        schools={mockSchools}
        filters={DEFAULT_FILTERS}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    fireEvent.click(screen.getByText('Filters'));
    expect(screen.getByText('School Type')).toBeInTheDocument();
    expect(screen.getByText('Tuition Range')).toBeInTheDocument();
    expect(screen.getByText('SAT Score Range')).toBeInTheDocument();
  });

  it('should display school types from data', () => {
    render(
      <Filters
        schools={mockSchools}
        filters={DEFAULT_FILTERS}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    fireEvent.click(screen.getByText('Filters'));
    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('should call onFiltersChange when type is selected', () => {
    render(
      <Filters
        schools={mockSchools}
        filters={DEFAULT_FILTERS}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    fireEvent.click(screen.getByText('Filters'));
    fireEvent.click(screen.getByText('Private'));

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        schoolTypes: ['Private'],
      })
    );
  });

  it('should show reset button and call onFiltersChange with defaults', () => {
    render(
      <Filters
        schools={mockSchools}
        filters={{ ...DEFAULT_FILTERS, states: ['CA'] }}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    fireEvent.click(screen.getByText('Filters'));
    fireEvent.click(screen.getByText('Reset All Filters'));

    expect(mockOnFiltersChange).toHaveBeenCalledWith(DEFAULT_FILTERS);
  });

  it('should show active filter count badge', () => {
    render(
      <Filters
        schools={mockSchools}
        filters={{ ...DEFAULT_FILTERS, states: ['CA', 'TX'] }}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
