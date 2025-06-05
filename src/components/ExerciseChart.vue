<template>
  <div class="exercise-chart-container">
    <div class="chart-wrapper">
      <Line
        v-if="chartData"
        :data="chartData"
        :options="chartOptions"
      />
    </div>
    <div v-if="monthlyComparison" class="monthly-comparison">
      <h4>Сравнение с прошлым месяцем:</h4>
      <div class="comparison-stats">
        <div class="stat">
          <span class="label">Максимальный рабочий вес:</span>
          <span class="value" :class="getComparisonClass(monthlyComparison.maxWeightDiff)">
            {{ monthlyComparison.currentMaxWeight }} кг
            ({{ formatDiff(monthlyComparison.maxWeightDiff) }})
          </span>
        </div>
        <div class="stat">
          <span class="label">Максимальный 1ПМ:</span>
          <span class="value" :class="getComparisonClass(monthlyComparison.maxOneRepMaxDiff)">
            {{ monthlyComparison.currentMaxOneRepMax }} кг
            ({{ formatDiff(monthlyComparison.maxOneRepMaxDiff) }})
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
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

const props = defineProps({
  exerciseData: {
    type: Array as PropType<ExerciseData[]>,
    required: true
  },
  exerciseName: {
    type: String,
    required: true
  }
})

// Функция для расчета среднего значения
const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0
  const sum = numbers.reduce((acc, val) => acc + val, 0)
  return Math.round((sum / numbers.length) * 10) / 10
}

// Функция форматирования разницы
const formatDiff = (diff: number): string => {
  if (diff === 0) return '±0 кг'
  return `${diff > 0 ? '+' : ''}${diff} кг`
}

// Функция определения класса для стилизации разницы
const getComparisonClass = (diff: number): string => {
  if (diff > 0) return 'positive'
  if (diff < 0) return 'negative'
  return 'neutral'
}

// Функция для группировки данных по месяцам
const groupByMonth = (data: ExerciseData[]) => {
  const groups = new Map<string, ExerciseData[]>()

  data.forEach(exercise => {
    const date = new Date(exercise.date)
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(exercise)
  })

  return Array.from(groups.entries()).map(([key, exercises]) => {
    const [year, month] = key.split('-').map(Number)
    return {
      date: new Date(year, month - 1, 1),
      maxWeight: Math.max(...exercises.map(e => e.weight)),
      maxOneRepMax: Math.max(...exercises.map(e => e.calculatedOneRepMax))
    }
  }).sort((a, b) => a.date.getTime() - b.date.getTime())
}

const monthlyComparison = computed(() => {
  if (!props.exerciseData.length) return null

  const exerciseData = [...props.exerciseData]
    .filter(e => e.name === props.exerciseName)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (exerciseData.length === 0) return null

  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const currentMonthData = exerciseData.filter(e => new Date(e.date) >= currentMonthStart)
  const lastMonthData = exerciseData.filter(e => {
    const date = new Date(e.date)
    return date >= lastMonthStart && date < currentMonthStart
  })

  const currentMaxWeight = Math.max(...currentMonthData.map(e => e.weight))
  const lastMaxWeight = Math.max(...lastMonthData.map(e => e.weight))
  const currentMaxOneRepMax = Math.max(...currentMonthData.map(e => e.calculatedOneRepMax))
  const lastMaxOneRepMax = Math.max(...lastMonthData.map(e => e.calculatedOneRepMax))

  return {
    currentMaxWeight,
    lastMaxWeight,
    currentMaxOneRepMax,
    lastMaxOneRepMax,
    maxWeightDiff: Math.round((currentMaxWeight - lastMaxWeight) * 10) / 10,
    maxOneRepMaxDiff: Math.round((currentMaxOneRepMax - lastMaxOneRepMax) * 10) / 10
  }
})

const chartData = computed(() => {
  if (!props.exerciseData.length) return null

  const exerciseData = [...props.exerciseData]
    .filter(e => e.name === props.exerciseName)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Группируем данные по месяцам для ступенчатого графика
  const monthlyData = groupByMonth(exerciseData)

  // Форматируем метки для всех точек данных
  const labels = exerciseData.map(e => new Date(e.date).toLocaleDateString())

  // Создаем массивы данных для ступенчатого графика максимумов по месяцам
  const monthlyLabels = monthlyData.map(d => d.date.toLocaleDateString())
  const monthlyMaxWeights = monthlyData.map(d => d.maxWeight)
  const monthlyMaxOneRepMax = monthlyData.map(d => d.maxOneRepMax)

  return {
    labels,
    datasets: [
      {
        label: 'Рабочий вес',
        data: exerciseData.map(e => e.weight),
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        order: 2
      },
      {
        label: '1ПМ (расчетный)',
        data: exerciseData.map(e => e.calculatedOneRepMax),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        order: 3
      },
      {
        label: 'Максимальный вес за месяц',
        data: Array(labels.length).fill(null).map((_, i) => {
          const date = new Date(exerciseData[i].date)
          const monthData = monthlyData.find(d =>
            d.date.getMonth() === date.getMonth() &&
            d.date.getFullYear() === date.getFullYear()
          )
          return monthData?.maxWeight
        }),
        borderColor: '#FF9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        steppedLine: 'middle',
        tension: 0,
        pointRadius: 0,
        borderWidth: 2,
        borderDash: [5, 5],
        order: 1
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const
    },
    title: {
      display: true,
      text: 'Прогресс в упражнении'
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.parsed.y
          if (value === null) return ''
          return `${context.dataset.label}: ${value} кг`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      title: {
        display: true,
        text: 'Вес (кг)'
      }
    },
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45
      }
    }
  }
}
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
