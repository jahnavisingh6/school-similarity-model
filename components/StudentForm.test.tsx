import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudentForm from './StudentForm';
import { getDefaultFeatureWeights } from '../utils/validation';
import type { School } from '../types';

// Mock CSS module
jest.mock('../styles/StudentForm.module.css', () => ({
  container: 'container',
  title: 'title',
  form: 'form',
  formGrid: 'formGrid',
  formGroup: 'formGroup',
  label: 'label',
  optional: 'optional',
  input: 'input',
  inputError: 'inputError',
  errorMessage: 'errorMessage',
  weightsSection: 'weightsSection',
  weightsToggle: 'weightsToggle',
  weightsGrid: 'weightsGrid',
  weightsDescription: 'weightsDescription',
  weightGroup: 'weightGroup',
  weightLabel: 'weightLabel',
  weightInput: 'weightInput',
  submitButton: 'submitButton',
  goalSection: 'goalSection',
  goalHeader: 'goalHeader',
  goalTitle: 'goalTitle',
  goalHint: 'goalHint',
  goalSearch: 'goalSearch',
  goalCounter: 'goalCounter',
  goalSuggestions: 'goalSuggestions',
  goalSuggestion: 'goalSuggestion',
  goalMeta: 'goalMeta',
  goalPills: 'goalPills',
  goalPill: 'goalPill',
  goalPillName: 'goalPillName',
  goalRemove: 'goalRemove'
}));

describe('StudentForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnWeightsChange = jest.fn();
  const mockOnGoalSchoolsChange = jest.fn();
  const defaultWeights = getDefaultFeatureWeights();
  const mockSchools: School[] = [
    {
      school_id: 1,
      school_name: 'Stanford University',
      city: 'Stanford',
      state: 'CA',
      avg_sat: 1500,
      avg_act: 34,
      graduation_rate: 94,
      acceptance_rate: 4,
      student_faculty_ratio: 6,
      tuition_cost: 62000,
      avg_aid: 30000,
      student_population: 17000,
      international_percentage: 20,
      latitude: 37.4275,
      longitude: -122.1697,
      ranking: 3,
      type: 'Private',
      urban_rural: 'Suburban'
    },
    {
      school_id: 2,
      school_name: 'UCLA',
      city: 'Los Angeles',
      state: 'CA',
      avg_sat: 1410,
      avg_act: 31,
      graduation_rate: 91,
      acceptance_rate: 9,
      student_faculty_ratio: 18,
      tuition_cost: 38000,
      avg_aid: 18000,
      student_population: 45000,
      international_percentage: 12,
      latitude: 34.0689,
      longitude: -118.4452,
      ranking: 15,
      type: 'Public',
      urban_rural: 'Urban'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderForm = (props = {}) => {
    return render(
      <StudentForm
        onSubmit={mockOnSubmit}
        featureWeights={defaultWeights}
        onWeightsChange={mockOnWeightsChange}
        schools={mockSchools}
        goalSchoolIds={[]}
        onGoalSchoolsChange={mockOnGoalSchoolsChange}
        {...props}
      />
    );
  };

  describe('Rendering', () => {
    it('should render the form title', () => {
      renderForm();
      expect(screen.getByText('Your Profile')).toBeInTheDocument();
    });

    it('should render all 12 input fields', () => {
      renderForm();

      expect(screen.getByLabelText(/SAT Score/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ACT Score/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Graduation Rate/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Acceptance Rate/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Student-Faculty Ratio/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tuition Cost/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Average Financial Aid/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Student Population/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/International Student/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Latitude/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Longitude/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Ranking/i)).toBeInTheDocument();
    });

    it('should render the submit button', () => {
      renderForm();
      expect(screen.getByRole('button', { name: /Find Similar Schools/i })).toBeInTheDocument();
    });

    it('should render the goal schools section', () => {
      renderForm();
      expect(screen.getByText('Goal Schools')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search by school name, city, or state/i)).toBeInTheDocument();
    });

    it('should render feature weights toggle', () => {
      renderForm();
      expect(screen.getByText(/Feature Weights/i)).toBeInTheDocument();
    });

    it('should mark latitude and longitude as optional', () => {
      renderForm();
      const optionalLabels = screen.getAllByText('(optional)');
      expect(optionalLabels.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Form Interaction', () => {
    it('should update input value on change', async () => {
      renderForm();
      const satInput = screen.getByLabelText(/SAT Score/i) as HTMLInputElement;

      await userEvent.type(satInput, '1400');
      expect(satInput.value).toBe('1400');
    });

    it('should toggle weights section visibility', async () => {
      renderForm();
      const toggle = screen.getByText(/Feature Weights/i);

      // Initially weights grid should not be visible
      expect(screen.queryByText(/Adjust importance/i)).not.toBeInTheDocument();

      // Click to show
      await userEvent.click(toggle);
      expect(screen.getByText(/Adjust importance/i)).toBeInTheDocument();

      // Click to hide
      await userEvent.click(toggle);
      expect(screen.queryByText(/Adjust importance/i)).not.toBeInTheDocument();
    });

    it('should suggest and add a goal school', async () => {
      renderForm();

      await userEvent.type(
        screen.getByPlaceholderText(/Search by school name, city, or state/i),
        'stan'
      );

      await userEvent.click(screen.getByRole('button', { name: /Stanford University/i }));

      expect(mockOnGoalSchoolsChange).toHaveBeenCalledWith([1]);
    });
  });

  describe('Validation', () => {
    it('should show error for invalid SAT score', async () => {
      renderForm();
      const satInput = screen.getByLabelText(/SAT Score/i);

      await userEvent.type(satInput, '300');
      fireEvent.blur(satInput);

      await waitFor(() => {
        expect(screen.getByText(/SAT Score must be between 400 and 1600/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty required field on blur', async () => {
      renderForm();
      const satInput = screen.getByLabelText(/SAT Score/i);

      fireEvent.focus(satInput);
      fireEvent.blur(satInput);

      await waitFor(() => {
        expect(screen.getByText(/SAT Score is required/i)).toBeInTheDocument();
      });
    });

    it('should not show error for empty optional fields', async () => {
      renderForm();
      const latInput = screen.getByLabelText(/Latitude/i);

      fireEvent.focus(latInput);
      fireEvent.blur(latInput);

      await waitFor(() => {
        expect(screen.queryByText(/Latitude is required/i)).not.toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing', async () => {
      renderForm();
      const satInput = screen.getByLabelText(/SAT Score/i);

      // Trigger error
      await userEvent.type(satInput, '300');
      fireEvent.blur(satInput);

      await waitFor(() => {
        expect(screen.getByText(/SAT Score must be between 400 and 1600/i)).toBeInTheDocument();
      });

      // Clear and type valid value
      await userEvent.clear(satInput);
      await userEvent.type(satInput, '1400');

      await waitFor(() => {
        expect(screen.queryByText(/SAT Score must be between 400 and 1600/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should not submit with empty required fields', async () => {
      renderForm();
      const submitButton = screen.getByRole('button', { name: /Find Similar Schools/i });

      await userEvent.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should disable submit button when form is invalid', () => {
      renderForm();
      const submitButton = screen.getByRole('button', { name: /Find Similar Schools/i });

      expect(submitButton).toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('should show loading text when isLoading is true', () => {
      renderForm({ isLoading: true });
      expect(screen.getByRole('button', { name: /Finding.../i })).toBeInTheDocument();
    });

    it('should disable inputs when loading', () => {
      renderForm({ isLoading: true });
      const satInput = screen.getByLabelText(/SAT Score/i);
      expect(satInput).toBeDisabled();
    });
  });

  describe('Feature Weights', () => {
    it('should call onWeightsChange when weight is modified', async () => {
      renderForm();

      // Open weights section
      const toggle = screen.getByText(/Feature Weights/i);
      await userEvent.click(toggle);

      // Find SAT weight input
      const satWeightInput = screen.getByLabelText(/SAT Score/i, {
        selector: '[id^="weight-"]'
      }) as HTMLInputElement;

      await userEvent.clear(satWeightInput);
      await userEvent.type(satWeightInput, '5');

      expect(mockOnWeightsChange).toHaveBeenCalled();
    });
  });
});
