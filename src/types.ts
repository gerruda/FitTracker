export interface MeasurementData {
  date: string;
  weight?: number;
  waterMass?: number;
  waterPercentage?: number;
  bodyFatMass?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  musclePercentage?: number;
  visceralFat?: number;
  bmi?: number;
  totalScore?: number;
  notes?: string;
  tdee?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    forearms?: number;
    thighs?: number;
    calves?: number;
    neck?: number;
  };
}

export interface ExerciseData {
  id: string;
  name: string;
  date: string;
  weight: number;
  reps: number;
  calculatedOneRepMax: number;
} 