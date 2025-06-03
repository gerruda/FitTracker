import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFitnessStore } from '../fitness';

describe('Fitness Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('Measurements', () => {
    it('should add a new measurement', () => {
      const store = useFitnessStore();
      const measurement = {
        date: '2024-02-20',
        weight: 70,
        notes: 'Test measurement'
      };

      store.addMeasurement(measurement);
      expect(store.measurements).toHaveLength(1);
      expect(store.measurements[0]).toEqual(measurement);
    });

    it('should update existing measurement', () => {
      const store = useFitnessStore();
      const initialMeasurement = {
        date: '2024-02-20',
        weight: 70
      };
      const updatedMeasurement = {
        date: '2024-02-20',
        weight: 71
      };

      store.addMeasurement(initialMeasurement);
      store.addMeasurement(updatedMeasurement);

      expect(store.measurements).toHaveLength(1);
      expect(store.measurements[0].weight).toBe(71);
    });

    it('should merge measurements with same date', () => {
      const store = useFitnessStore();
      const weightMeasurement = {
        date: '2024-02-20',
        weight: 70
      };
      const bodyMeasurement = {
        date: '2024-02-20',
        measurements: {
          chest: 100,
          waist: 80
        }
      };

      store.addMeasurement(weightMeasurement);
      store.addMeasurement(bodyMeasurement);

      expect(store.measurements).toHaveLength(1);
      expect(store.measurements[0]).toEqual({
        date: '2024-02-20',
        weight: 70,
        measurements: {
          chest: 100,
          waist: 80
        }
      });
    });

    it('should delete measurement', () => {
      const store = useFitnessStore();
      const measurement = {
        date: '2024-02-20',
        weight: 70
      };

      store.addMeasurement(measurement);
      expect(store.measurements).toHaveLength(1);

      store.deleteMeasurement('2024-02-20');
      expect(store.measurements).toHaveLength(0);
    });

    it('should clear all measurements', () => {
      const store = useFitnessStore();
      const measurements = [
        { date: '2024-02-20', weight: 70 },
        { date: '2024-02-21', weight: 71 }
      ];

      measurements.forEach(m => store.addMeasurement(m));
      expect(store.measurements).toHaveLength(2);

      store.clearMeasurements();
      expect(store.measurements).toHaveLength(0);
    });
  });

  describe('Data Import/Export', () => {
    it('should export data correctly', () => {
      const store = useFitnessStore();
      const measurement = {
        date: '2024-02-20',
        weight: 70
      };

      store.addMeasurement(measurement);
      const exported = store.exportData();
      const parsed = JSON.parse(exported);

      expect(parsed.measurements).toHaveLength(1);
      expect(parsed.measurements[0]).toEqual(measurement);
      expect(parsed.version).toBe('1.0');
    });

    it('should import data correctly', () => {
      const store = useFitnessStore();
      const data = {
        measurements: [
          { date: '2024-02-20', weight: 70 }
        ],
        exercises: [],
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const success = store.importData(JSON.stringify(data));
      expect(success).toBe(true);
      expect(store.measurements).toHaveLength(1);
      expect(store.measurements[0]).toEqual(data.measurements[0]);
    });

    it('should handle invalid import data', () => {
      const store = useFitnessStore();
      const invalidData = {
        measurements: 'not an array'
      };

      const success = store.importData(JSON.stringify(invalidData));
      expect(success).toBe(false);
      expect(store.measurements).toHaveLength(0);
    });
  });
}); 