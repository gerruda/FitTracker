import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFitnessStore } from '../fitness';
import type { ExerciseData } from '@/types';

describe('Fitness Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
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

    it('should merge measurements with same date', () => {
      const store = useFitnessStore();
      const initialMeasurement = {
        date: '2024-02-20',
        weight: 70
      };
      const updatedMeasurement = {
        date: '2024-02-20',
        bodyFatPercentage: 20
      };

      store.addMeasurement(initialMeasurement);
      store.addMeasurement(updatedMeasurement);

      expect(store.measurements).toHaveLength(1);
      expect(store.measurements[0]).toEqual({
        date: '2024-02-20',
        weight: 70,
        bodyFatPercentage: 20
      });
    });

    it('should merge all measurement properties', () => {
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
    });

    it('should import data correctly', () => {
      const store = useFitnessStore();
      const data = {
        measurements: [
          { date: '2024-02-20', weight: 70 }
        ],
        exercises: []
      };

      const success = store.importData(JSON.stringify(data));
      expect(success).toBe(true);
      expect(store.measurements).toHaveLength(1);
      expect(store.measurements[0]).toEqual(data.measurements[0]);
    });

    it('should handle invalid import data', () => {
      const store = useFitnessStore();
      const invalidData = "{ not a valid json }";

      const success = store.importData(invalidData);
      expect(success).toBe(false);
      expect(store.measurements).toHaveLength(0);
    });
  });

  describe('Exercise Management', () => {
    const mockExercise: ExerciseData = {
      id: '1',
      name: 'Приседания',
      date: '2024-03-14',
      weight: 100,
      reps: 5,
      calculatedOneRepMax: 115
    };

    it('should add exercise', () => {
      const store = useFitnessStore();
      store.addExercise(mockExercise);
      expect(store.exercises).toHaveLength(1);
      expect(store.exercises[0]).toEqual(mockExercise);
    });

    it('should update exercise', () => {
      const store = useFitnessStore();
      store.addExercise(mockExercise);

      const updatedExercise = {
        ...mockExercise,
        weight: 110,
        reps: 6,
        calculatedOneRepMax: 130
      };

      store.updateExercise(updatedExercise);
      expect(store.exercises).toHaveLength(1);
      expect(store.exercises[0]).toEqual(updatedExercise);
    });

    it('should delete exercise', () => {
      const store = useFitnessStore();
      store.addExercise(mockExercise);
      expect(store.exercises).toHaveLength(1);

      store.deleteExercise(mockExercise.id);
      expect(store.exercises).toHaveLength(0);
    });

    it('should calculate one rep max correctly', () => {
      const store = useFitnessStore();
      const weight = 100;
      const reps = 5;

      // Проверяем формулу Брзыцки: weight * (36 / (37 - reps))
      const expectedOneRepMax = Math.round(weight * (36 / (37 - reps)));
      const calculatedOneRepMax = store.calculateOneRepMax(weight, reps);

      expect(calculatedOneRepMax).toBe(expectedOneRepMax);
    });

    it('should persist exercises to localStorage', () => {
      const store = useFitnessStore();
      store.addExercise(mockExercise);

      // Проверяем, что данные сохранились в localStorage
      const savedExercises = JSON.parse(localStorage.getItem('exercises') || '[]');
      expect(savedExercises).toHaveLength(1);
      expect(savedExercises[0]).toEqual(mockExercise);
    });

    it('should load exercises from localStorage', () => {
      // Сначала сохраняем данные в localStorage
      localStorage.setItem('exercises', JSON.stringify([mockExercise]));

      // Создаем новый экземпляр store и загружаем данные
      const store = useFitnessStore();
      store.loadExercises();

      expect(store.exercises).toHaveLength(1);
      expect(store.exercises[0]).toEqual(mockExercise);
    });
  });
});
