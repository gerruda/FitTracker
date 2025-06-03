import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import type { DefineComponent } from 'vue';
import BodyComposition from '../BodyComposition.vue';
import { useFitnessStore } from '@/stores/fitness';
import '@testing-library/jest-dom';

describe('BodyComposition', () => {
  const renderComponent = () => {
    return render(BodyComposition as DefineComponent, {
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
    expect(screen.getByText('Состав тела')).toBeInTheDocument();
    expect(screen.getByText('Загрузить фото отчета')).toBeInTheDocument();
  });

  it('handles file upload', async () => {
    renderComponent();
    const input = screen.getByLabelText('Загрузить фото отчета') as HTMLInputElement;
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    
    Object.defineProperty(input, 'files', {
      value: [file]
    });

    await fireEvent.change(input);
    
    expect(input.files?.[0]).toBe(file);
    expect(input.files?.item(0)).toBe(file);
  });

  it('displays manual input form', async () => {
    renderComponent();
    const manualButton = screen.getByText('Ввести данные вручную');
    await fireEvent.click(manualButton);

    expect(screen.getByLabelText('Процент жира (%)')).toBeInTheDocument();
    expect(screen.getByLabelText('Масса жира (кг)')).toBeInTheDocument();
    expect(screen.getByLabelText('Процент мышц (%)')).toBeInTheDocument();
    expect(screen.getByLabelText('Масса мышц (кг)')).toBeInTheDocument();
    expect(screen.getByLabelText('Процент воды (%)')).toBeInTheDocument();
    expect(screen.getByLabelText('Масса воды (кг)')).toBeInTheDocument();
  });

  it('handles manual data submission', async () => {
    renderComponent();
    const store = useFitnessStore();
    const manualButton = screen.getByText('Ввести данные вручную');
    await fireEvent.click(manualButton);

    // Fill in the form
    await fireEvent.update(screen.getByLabelText('Процент жира (%)'), '20');
    await fireEvent.update(screen.getByLabelText('Масса жира (кг)'), '14');
    await fireEvent.update(screen.getByLabelText('Процент мышц (%)'), '40');
    await fireEvent.update(screen.getByLabelText('Масса мышц (кг)'), '28');
    await fireEvent.update(screen.getByLabelText('Процент воды (%)'), '60');
    await fireEvent.update(screen.getByLabelText('Масса воды (кг)'), '42');
    await fireEvent.update(screen.getByLabelText('Заметки'), 'Test notes');

    // Submit the form
    await fireEvent.click(screen.getByText('Сохранить'));

    // Verify store action was called with correct data
    expect(store.addMeasurement).toHaveBeenCalledWith(expect.objectContaining({
      bodyFatPercentage: 20,
      bodyFatMass: 14,
      musclePercentage: 40,
      muscleMass: 28,
      waterPercentage: 60,
      waterMass: 42,
      notes: 'Test notes'
    }));
  });

  it('validates form inputs', async () => {
    renderComponent();
    const manualButton = screen.getByText('Ввести данные вручную');
    await fireEvent.click(manualButton);

    // Try to submit empty form
    await fireEvent.click(screen.getByText('Сохранить'));

    // Check for validation messages
    expect(screen.getByText('Заполните хотя бы одно измерение')).toBeInTheDocument();

    // Fill in invalid values
    await fireEvent.update(screen.getByLabelText('Процент жира (%)'), '101');
    await fireEvent.update(screen.getByLabelText('Процент мышц (%)'), '-1');

    // Submit form with invalid values
    await fireEvent.click(screen.getByText('Сохранить'));

    // Check for validation messages
    expect(screen.getByText('Процент должен быть от 0 до 100')).toBeInTheDocument();
  });

  it('calculates mass values automatically', async () => {
    renderComponent();
    const manualButton = screen.getByText('Ввести данные вручную');
    await fireEvent.click(manualButton);

    // Enter total weight
    await fireEvent.update(screen.getByLabelText('Общий вес (кг)'), '70');

    // Enter percentages
    await fireEvent.update(screen.getByLabelText('Процент жира (%)'), '20');
    await fireEvent.update(screen.getByLabelText('Процент мышц (%)'), '40');
    await fireEvent.update(screen.getByLabelText('Процент воды (%)'), '60');

    // Check if mass values are calculated correctly
    expect(screen.getByLabelText('Масса жира (кг)')).toHaveValue('14');
    expect(screen.getByLabelText('Масса мышц (кг)')).toHaveValue('28');
    expect(screen.getByLabelText('Масса воды (кг)')).toHaveValue('42');
  });

  it('calculates percentage values automatically', async () => {
    renderComponent();
    const manualButton = screen.getByText('Ввести данные вручную');
    await fireEvent.click(manualButton);

    // Enter total weight
    await fireEvent.update(screen.getByLabelText('Общий вес (кг)'), '70');

    // Enter mass values
    await fireEvent.update(screen.getByLabelText('Масса жира (кг)'), '14');
    await fireEvent.update(screen.getByLabelText('Масса мышц (кг)'), '28');
    await fireEvent.update(screen.getByLabelText('Масса воды (кг)'), '42');

    // Check if percentage values are calculated correctly
    expect(screen.getByLabelText('Процент жира (%)')).toHaveValue('20');
    expect(screen.getByLabelText('Процент мышц (%)')).toHaveValue('40');
    expect(screen.getByLabelText('Процент воды (%)')).toHaveValue('60');
  });
}); 