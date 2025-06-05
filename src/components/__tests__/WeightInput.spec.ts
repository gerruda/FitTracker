import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import WeightInput from '../WeightInput.vue';
import { useFitnessStore } from '@/stores/fitness';
import '@testing-library/jest-dom';

describe('WeightInput', () => {
  const renderComponent = () => {
    return render(WeightInput, {
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            fitness: {
              measurements: []
            }
          }
        })]
      }
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component correctly', () => {
    renderComponent();
    expect(screen.getByText('Запись веса')).toBeInTheDocument();
    expect(screen.getByLabelText('Вес (кг)')).toBeInTheDocument();
    expect(screen.getByLabelText('Примечания')).toBeInTheDocument();
    expect(screen.getByText('Сохранить')).toBeInTheDocument();
  });

  it('handles form submission with valid data', async () => {
    renderComponent();
    useFitnessStore();
    const today = new Date().toISOString().split('T')[0];

    // Fill in the form
    await fireEvent.update(screen.getByLabelText('Вес (кг)'), '70.5');
    await fireEvent.update(screen.getByLabelText('Примечания'), 'Test weight measurement');

    // Submit the form
    await fireEvent.click(screen.getByText('Сохранить'));

    // Verify store action was called with correct data
    expect(useFitnessStore().addMeasurement).toHaveBeenCalledWith({
      date: today,
      weight: 70.5,
      notes: 'Test weight measurement'
    });
  });

  it('requires weight input', async () => {
    renderComponent();
    const weightInput = screen.getByLabelText('Вес (кг)');

    // Try to submit empty form
    await fireEvent.click(screen.getByText('Сохранить'));

    // Check that HTML5 validation is working
    expect(weightInput).toBeRequired();
  });

  it('clears form after successful submission', async () => {
    renderComponent();
    useFitnessStore();

    // Fill in the form
    await fireEvent.update(screen.getByLabelText('Вес (кг)'), '70.5');
    await fireEvent.update(screen.getByLabelText('Примечания'), 'Test notes');

    // Submit the form
    await fireEvent.click(screen.getByText('Сохранить'));

    // Check if form is cleared
    expect(screen.getByLabelText('Вес (кг)')).toHaveValue(0);
    expect(screen.getByLabelText('Примечания')).toHaveValue('');
  });

  it('handles decimal values correctly', async () => {
    renderComponent();
    useFitnessStore();
    const today = new Date().toISOString().split('T')[0];

    // Fill in the form with decimal value
    await fireEvent.update(screen.getByLabelText('Вес (кг)'), '70.5');

    // Submit the form
    await fireEvent.click(screen.getByText('Сохранить'));

    // Verify store action was called with correct decimal value
    expect(useFitnessStore().addMeasurement).toHaveBeenCalledWith({
      date: today,
      weight: 70.5,
      notes: ''
    });
  });

  it('handles integer values correctly', async () => {
    renderComponent();
    useFitnessStore();
    const today = new Date().toISOString().split('T')[0];

    // Fill in the form with integer value
    await fireEvent.update(screen.getByLabelText('Вес (кг)'), '70');

    // Submit the form
    await fireEvent.click(screen.getByText('Сохранить'));

    // Verify store action was called with correct integer value
    expect(useFitnessStore().addMeasurement).toHaveBeenCalledWith({
      date: today,
      weight: 70,
      notes: ''
    });
  });
});
