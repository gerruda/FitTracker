import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import { createTestingPinia } from '@pinia/testing';
import MeasurementHistoryTable from '../MeasurementHistoryTable.vue';
import { useFitnessStore } from '@/stores/fitness';
import type { MeasurementData } from '@/types';
import '@testing-library/jest-dom';

describe('MeasurementHistoryTable', () => {
  const renderComponent = (type: 'weight' | 'body' | 'composition') => {
    return render(MeasurementHistoryTable, {
      props: { type },
      global: {
        plugins: [createTestingPinia({
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
    localStorage.clear();
  });

  it('renders empty state when no measurements', () => {
    renderComponent('weight');
    expect(screen.getByText('Нет записей')).toBeInTheDocument();
  });

  it('displays weight measurements correctly', async () => {
    const store = useFitnessStore();
    const measurement: MeasurementData = {
      date: '2024-02-20',
      weight: 70,
      notes: 'Test note'
    };
    store.measurements = [measurement];

    renderComponent('weight');
    expect(screen.getByText('20.02.2024')).toBeInTheDocument();
    expect(screen.getByText('70 кг')).toBeInTheDocument();
    expect(screen.getByText('Test note')).toBeInTheDocument();
  });

  it('emits edit event when edit button clicked', async () => {
    const store = useFitnessStore();
    const measurement: MeasurementData = {
      date: '2024-02-20',
      weight: 70
    };
    store.measurements = [measurement];

    const { emitted } = renderComponent('weight');
    const editButton = screen.getByTitle('Редактировать');
    await fireEvent.click(editButton);

    expect(emitted()).toHaveProperty('edit');
    expect(emitted().edit[0]).toEqual([measurement]);
  });

  it('deletes measurement when delete button clicked', async () => {
    const store = useFitnessStore();
    const measurement: MeasurementData = {
      date: '2024-02-20',
      weight: 70
    };
    store.measurements = [measurement];

    renderComponent('weight');
    const deleteButton = screen.getByTitle('Удалить');
    await fireEvent.click(deleteButton);

    expect(store.deleteMeasurement).toHaveBeenCalledWith('2024-02-20');
  });
});
