<template>
  <div class="exercise-chart-container">
    <div class="chart-wrapper">
      <Line
        v-if="chartData"
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import type { ExerciseData } from '@/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ChartDataset {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
  tension: number
  pointRadius: number
  pointHoverRadius?: number
  order: number
  stepped?: boolean | 'before' | 'after' | 'middle'
  borderWidth?: number
  borderDash?: number[]
}

const props = defineProps<{
  exercises: ExerciseData[]
}>()

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric'
  })
}

const getMonthKey = (date: string) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const chartData = computed<ChartData<'line'>>(() => {
  if (!props.exercises.length) return {
    labels: [],
    datasets: []
  }

  // Сортируем упражнения по дате в хронологическом порядке
  const sortedExercises = [...props.exercises].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const labels = sortedExercises.map(e => formatDate(e.date))
  const weights = sortedExercises.map(e => e.weight)
  const oneRepMaxes = sortedExercises.map(e => e.calculatedOneRepMax)

  // Группируем данные по месяцам и находим максимумы
  const monthlyMaxes = new Map<string, number>()
  sortedExercises.forEach(exercise => {
    const monthKey = getMonthKey(exercise.date)
    const currentMax = monthlyMaxes.get(monthKey) || 0
    monthlyMaxes.set(monthKey, Math.max(currentMax, exercise.weight))
  })

  // Создаем массив максимумов для каждой точки данных
  const monthlyMaxLine = sortedExercises.map(exercise => {
    const monthKey = getMonthKey(exercise.date)
    return monthlyMaxes.get(monthKey) || 0
  })

  // Получаем предыдущий месяц
  const now = new Date()
  const currentMonthKey = getMonthKey(now.toISOString())
  now.setMonth(now.getMonth() - 1)
  const prevMonthKey = getMonthKey(now.toISOString())

  // Получаем максимумы для текущего и предыдущего месяца
  const currentMonthMax = monthlyMaxes.get(currentMonthKey) || 0
  const prevMonthMax = monthlyMaxes.get(prevMonthKey) || 0

  const datasets: ChartDataset[] = [
    {
      label: 'Вес',
      data: weights,
      borderColor: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      order: 3
    },
    {
      label: '1RM (одноповторный максимум)',
      data: oneRepMaxes,
      borderColor: '#9C27B0',
      backgroundColor: 'rgba(156, 39, 176, 0.1)',
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      order: 2
    },
    {
      label: 'Максимальный вес по месяцам',
      data: monthlyMaxLine,
      borderColor: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      stepped: 'before',
      tension: 0,
      pointRadius: 0,
      borderWidth: 2,
      order: 1
    }
  ]

  // Добавляем линию предыдущего месяца только если есть данные
  if (prevMonthMax > 0) {
    datasets.push({
      label: `Максимум за ${formatDate(now.toISOString())}`,
      data: Array(weights.length).fill(prevMonthMax),
      borderColor: '#FF9800',
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
      stepped: 'before',
      tension: 0,
      pointRadius: 0,
      borderWidth: 2,
      borderDash: [5, 5],
      order: 0
    })
  }

  return {
    labels,
    datasets
  }
})

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: true,
      text: 'Прогресс в весе'
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || ''
          const value = context.parsed.y
          return `${label}: ${value} кг`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Вес (кг)'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Дата'
      },
      ticks: {
        maxRotation: 45,
        minRotation: 45
      }
    }
  }
}))
</script>

<style scoped>
.exercise-chart-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 2rem 0;
}

.chart-wrapper {
  height: 400px;
  width: 100%;
}

.monthly-comparison {
  padding: 1rem;
  background: var(--bg-light);
  border-radius: var(--border-radius);
}

.monthly-comparison h4 {
  margin: 0 0 1rem 0;
  color: var(--secondary-color);
}

.comparison-stats {
  display: grid;
  gap: 0.5rem;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--border-radius);
}

.stat .label {
  color: var(--text-muted);
}

.stat .value {
  font-weight: 500;
}

.value.positive {
  color: #4CAF50;
}

.value.negative {
  color: #f44336;
}

.value.neutral {
  color: var(--text-color);
}
</style>
