import type { ChartData, ChartOptions } from 'chart.js';

export type ChartDataset = {
  label: string;
  data: (number | null)[];
  borderColor: string;
  tension: number;
  fill?: boolean;
  yAxisID?: string;
};

export type FitnessChartData = ChartData<'line', (number | null)[]>;
export type FitnessChartOptions = ChartOptions<'line'>;

export const defaultChartOptions: Partial<FitnessChartOptions> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const
  },
  plugins: {
    legend: {
      position: 'top' as const
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false
    }
  },
  elements: {
    line: {
      tension: 0.4
    }
  }
}; 