import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import BodyMeasurements from '../BodyMeasurements.vue';
import { useFitnessStore } from '@/stores/fitness';
import '@testing-library/jest-dom';

describe('BodyMeasurements', () => {
  const renderComponent = () => {
    return render(BodyMeasurements, {
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
    expect(screen.getByText('Замеры тела')).toBeInTheDocument();
    expect(screen.getByLabelText('Грудь (см)')).toBeInTheDocument();
    expect(screen.getByLabelText('Талия (см)')).toBeInTheDocument();
    expect(screen.getByLabelText('Бедра (см)')).toBeInTheDocument();
  });

  it('validates form inputs and handles submission', async () => {
    renderComponent();
    const store = useFitnessStore();

    // Try to submit empty form
    await fireEvent.click(screen.getByText('Сохранить'));
    expect(screen.getByText('Заполните хотя бы одно измерение')).toBeInTheDocument();

    // Fill in valid values
    await fireEvent.update(screen.getByLabelText('Грудь (см)'), '100');
    await fireEvent.update(screen.getByLabelText('Талия (см)'), '80');
    await fireEvent.update(screen.getByLabelText('Заметки'), 'Test notes');

    // Submit form
    await fireEvent.click(screen.getByText('Сохранить'));

    // Check if store method was called
    expect(store.addMeasurement).toHaveBeenCalledWith(expect.objectContaining({
      measurements: {
        chest: 100,
        waist: 80
      },
      notes: 'Test notes'
    }));

    // Check if form is cleared
    expect(screen.getByLabelText('Грудь (см)')).toHaveValue('');
    expect(screen.getByLabelText('Талия (см)')).toHaveValue('');
    expect(screen.getByLabelText('Заметки')).toHaveValue('');
  });
}); 