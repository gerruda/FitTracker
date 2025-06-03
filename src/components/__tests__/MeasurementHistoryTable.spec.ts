import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import MeasurementHistoryTable from '../MeasurementHistoryTable.vue';
import { useFitnessStore } from '@/stores/fitness';
import '@testing-library/jest-dom';

describe('MeasurementHistoryTable', () => {
  const renderComponent = (type = 'weight') => {
    return render(MeasurementHistoryTable, {
      props: { type },
      global: {
        plugins: [createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            fitness: {
              measurements: [
                {
                  date: '2024-02-20',
                  weight: 70,
                  notes: 'Weight measurement'
                }
              ]
            }
          }
        })]
      }
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders measurements based on type', () => {
    renderComponent('weight');
    expect(screen.getByText('70')).toBeInTheDocument();
    expect(screen.getByText('Weight measurement')).toBeInTheDocument();
  });

  it('handles edit and delete actions', async () => {
    const { emitted } = renderComponent('weight');
    const store = useFitnessStore();
    
    // Test edit action
    const editButton = screen.getByTitle('Редактировать');
    await fireEvent.click(editButton);
    expect(emitted().edit).toBeTruthy();
    expect(emitted().edit[0][0]).toEqual({
      date: '2024-02-20',
      weight: 70,
      notes: 'Weight measurement'
    });

    // Test delete action with confirmation
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    const deleteButton = screen.getByTitle('Удалить');
    await fireEvent.click(deleteButton);
    expect(store.deleteMeasurement).toHaveBeenCalledWith('2024-02-20');

    // Test delete action without confirmation
    vi.spyOn(window, 'confirm').mockImplementation(() => false);
    await fireEvent.click(deleteButton);
    expect(store.deleteMeasurement).toHaveBeenCalledTimes(1); // Should not increase
  });

  it('shows empty state when no measurements', () => {
    render(MeasurementHistoryTable, {
      props: { type: 'weight' },
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
    expect(screen.getByText('История измерений пуста')).toBeInTheDocument();
  });
}); 