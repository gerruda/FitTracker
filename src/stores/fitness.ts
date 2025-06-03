import { defineStore } from 'pinia';
import type { MeasurementData, ExerciseData } from '@/types';

export const useFitnessStore = defineStore('fitness', {
  state: () => ({
    measurements: [] as MeasurementData[],
    exercises: [] as ExerciseData[],
    editingMeasurement: null as MeasurementData | null,
    hasSeenIntro: false
  }),

  getters: {
    sortedMeasurements: (state) => {
      return [...state.measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  },

  actions: {
    addMeasurement(measurement: MeasurementData) {
      this.measurements.push(measurement);
      this.saveMeasurements();
    },

    deleteMeasurement(date: string) {
      this.measurements = this.measurements.filter((m: MeasurementData) => m.date !== date);
      this.saveMeasurements();
    },

    addExercise(exercise: ExerciseData) {
      this.exercises.push(exercise);
      this.saveExercises();
    },

    deleteExercise(id: string) {
      this.exercises = this.exercises.filter((e: ExerciseData) => e.id !== id);
      this.saveExercises();
    },

    setEditingMeasurement(measurement: MeasurementData | null) {
      this.editingMeasurement = measurement;
    },

    calculateOneRepMax(weight: number, reps: number): number {
      // Формула Брзыцки
      return Math.round(weight * (36 / (37 - reps)));
    },

    calculateWaterIntake(weight: number): number {
      // 30-35 мл на кг веса
      return Math.round(weight * 33);
    },

    saveMeasurements() {
      localStorage.setItem('measurements', JSON.stringify(this.measurements));
    },

    saveExercises() {
      localStorage.setItem('exercises', JSON.stringify(this.exercises));
    },

    loadMeasurements() {
      const savedMeasurements = localStorage.getItem('measurements');
      if (savedMeasurements) {
        this.measurements = JSON.parse(savedMeasurements);
      }
    },

    loadExercises() {
      const savedExercises = localStorage.getItem('exercises');
      if (savedExercises) {
        this.exercises = JSON.parse(savedExercises);
      }
    },

    loadFromStorage() {
      this.loadMeasurements();
      this.loadExercises();
      const hasSeenIntro = localStorage.getItem('hasSeenIntro');
      this.hasSeenIntro = hasSeenIntro === 'true';
    },

    clearAllData() {
      this.measurements = [];
      this.exercises = [];
      this.saveMeasurements();
      this.saveExercises();
    },

    clearMeasurements() {
      this.measurements = [];
      this.saveMeasurements();
    },

    exportData() {
      return JSON.stringify({
        measurements: this.measurements,
        exercises: this.exercises
      });
    },

    importData(data: string): boolean {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed.measurements)) {
          this.measurements = parsed.measurements;
          this.saveMeasurements();
        }
        if (Array.isArray(parsed.exercises)) {
          this.exercises = parsed.exercises;
          this.saveExercises();
        }
        return true;
      } catch (e) {
        console.error('Failed to import data:', e);
        return false;
      }
    },

    calculateTDEE(weight: number, bodyFatPercentage: number, activityLevel: number): number {
      // Формула Каха-МакАрдла
      const leanMass = weight * (1 - bodyFatPercentage / 100);
      const bmr = 370 + (21.6 * leanMass);
      return Math.round(bmr * activityLevel);
    },

    setHasSeenIntro(value: boolean) {
      this.hasSeenIntro = value;
      localStorage.setItem('hasSeenIntro', String(value));
    }
  }
}); 