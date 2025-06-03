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
    expect(screen.getByText('Вес')).toBeInTheDocument();
    expect(screen.getByLabelText('Вес (кг)')).toBeInTheDocument();
    expect(screen.getByLabelText('Заметки')).toBeInTheDocument();
    expect(screen.getByText('Сохранить')).toBeInTheDocument();
  });

  it('handles form submission with valid data', async () => {
    renderComponent();
    const store = useFitnessStore();

    // Fill in the form
    await fireEvent.update(screen.getByLabelText('Вес (кг)'), '70.5');
    await fireEvent.update(screen.getByLabelText('Заметки'), 'Test weight measurement');

    // Submit the form
    await fireEvent.click(screen.getByText('Сохранить'));

    // Verify store action was called with correct data
    expect(store.addMeasurement).toHaveBeenCalledWith(expect.objectContaining({
      weight: 70.5,
      notes: 'Test weight measurement'
    }));
  });

  it('validates form inputs', async () => {
    renderComponent();

    // Try to submit empty form
    await fireEvent.click(screen.getByText('Сохранить'));

    // Check for validation messages
    expect(screen.getByText('Введите вес')).toBeInTheDocument();

    // Fill in invalid values (negative numbers)
    await fireEvent.update(screen.getByLabelText('Вес (кг)'), '-50');

    // Submit form with invalid values
    await fireEvent.click(screen.getByText('Сохранить'));

    // Check for validation messages
    expect(screen.getByText('Вес должен быть положительным числом')).toBeInTheDocument();
  });

  it('clears form after successful submission', async () => {
    renderComponent();

    // Fill in the form
    await fireEvent.update(screen.getByLabelText('Вес (кг)'), '70.5');
    await fireEvent.update(screen.getByLabelText('Заметки'), 'Test notes');

    // Submit the form
    await fireEvent.click(screen.getByText('Сохранить'));

    // Check if form is cleared
    expect(screen.getByLabelText('Вес (кг)')).toHaveValue('');
    expect(screen.getByLabelText('Заметки')).toHaveValue('');
  });

  it('preserves form data when validation fails', async () => {
    renderComponent();

    // Fill in the form with invalid data
    await fireEvent.update(screen.getByLabelText('Вес (кг)'), '-70.5');
    await fireEvent.update(screen.getByLabelText('Заметки'), 'Test notes');

    // Submit form with invalid values
    await fireEvent.click(screen.getByText('Сохранить'));

    // Check if form data is preserved
    expect(screen.getByLabelText('Вес (кг)')).toHaveValue('-70.5');
    expect(screen.getByLabelText('Заметки')).toHaveValue('Test notes');
  });

  it('handles decimal values correctly', async () => {
    renderComponent();
    const store = useFitnessStore();

    // Fill in the form with decimal value
    await fireEvent.update(screen.getByLabelText('Вес (кг)'), '70.5');

    // Submit the form
    await fireEvent.click(screen.getByText('Сохранить'));

    // Verify store action was called with correct decimal value
    expect(store.addMeasurement).toHaveBeenCalledWith(expect.objectContaining({
      weight: 70.5
    }));
  });

  it('handles integer values correctly', async () => {
    renderComponent();
    const store = useFitnessStore();

    // Fill in the form with integer value
    await fireEvent.update(screen.getByLabelText('Вес (кг)'), '70');

    // Submit the form
    await fireEvent.click(screen.getByText('Сохранить'));

    // Verify store action was called with correct integer value
    expect(store.addMeasurement).toHaveBeenCalledWith(expect.objectContaining({
      weight: 70
    }));
  });
}); 