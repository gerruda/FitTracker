import type { ChartData, ChartOptions } from 'chart.js';

export interface MeasurementData {
  date: string;
  weight?: number;
  waterMass?: number;
  waterPercentage?: number;
  bodyFatMass?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  musclePercentage?: number;
  boneMass?: number;
  bonePercentage?: number;
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

export type ChartDataset = {
  label: string;
  data: (number | null)[];
  borderColor: string;
  tension: number;
  yAxisID?: 'percentage' | 'mass';
  hidden?: boolean;
}

export type LineChartData = ChartData<'line', (number | null)[], string>;

export type ChartScale = {
  type: 'linear';
  position: 'left' | 'right';
  min: number;
  max?: number;
  title: {
    display: boolean;
    text: string;
  };
  grid: {
    display?: boolean;
    drawBorder?: boolean;
  };
  ticks?: {
    callback?: (value: number) => string;
  };
}

export type LineChartOptions = ChartOptions<'line'> & {
  responsive: true;
  maintainAspectRatio: false;
  plugins: {
    legend: {
      position: 'top';
    };
  };
  scales: {
    [key: string]: ChartScale;
  };
}
