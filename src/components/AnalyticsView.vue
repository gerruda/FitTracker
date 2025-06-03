<template>
  <div class="analytics">
    <div class="container">
      <div class="card">
        <h2>Аналитика</h2>

        <div class="chart-filters">
          <div class="form-group">
            <label for="timeRange">Временной период</label>
            <select v-model="timeRange" id="timeRange" class="form-control">
              <option value="7">Последние 7 дней</option>
              <option value="30">Последние 30 дней</option>
              <option value="90">Последние 3 месяца</option>
              <option value="180">Последние 6 месяцев</option>
              <option value="365">Последний год</option>
              <option value="all">Все время</option>
            </select>
          </div>
        </div>

        <div class="charts-grid">
          <div class="chart-card">
            <h3>Динамика веса</h3>
            <div class="chart-container">
              <Line
                v-if="weightChartData.datasets[0].data.length > 0"
                :data="weightChartData"
                :options="chartOptions"
              />
              <p v-else class="no-data">Нет данных о весе</p>
            </div>
          </div>

          <div class="chart-card">
            <h3>Состав тела</h3>
            <div class="chart-container">
              <Line
                v-if="bodyCompositionChartData.datasets[0].data.length > 0"
                :data="bodyCompositionChartData"
                :options="chartOptions"
              />
              <p v-else class="no-data">Нет данных о составе тела</p>
            </div>
          </div>

          <div class="chart-card">
            <h3>Измерения тела</h3>
            <div class="chart-container">
              <Line
                v-if="measurementsChartData.datasets[0].data.length > 0"
                :data="measurementsChartData"
                :options="chartOptions"
              />
              <p v-else class="no-data">Нет данных об измерениях</p>
            </div>
          </div>
        </div>

        <div class="statistics">
          <h3>Статистика</h3>

          <div class="stats-grid">
            <div class="stat-card" v-if="weightStats.current">
              <h4>Вес</h4>
              <p class="current">Текущий: {{ weightStats.current }}кг</p>
              <p
                class="change"
                :class="{ positive: weightStats.change > 0, negative: weightStats.change < 0 }"
              >
                Изменение: {{ weightStats.change > 0 ? '+' : '' }}{{ weightStats.change }}кг
              </p>
            </div>

            <div class="stat-card" v-if="bodyFatStats.current">
              <h4>Процент жира</h4>
              <p class="current">Текущий: {{ bodyFatStats.current }}%</p>
              <p
                class="change"
                :class="{ positive: bodyFatStats.change < 0, negative: bodyFatStats.change > 0 }"
              >
                Изменение: {{ bodyFatStats.change > 0 ? '+' : '' }}{{ bodyFatStats.change }}%
              </p>
            </div>

            <div class="stat-card" v-if="muscleStats.current">
              <h4>Мышечная масса</h4>
              <p class="current">Текущая: {{ muscleStats.current }}%</p>
              <p
                class="change"
                :class="{ positive: muscleStats.change > 0, negative: muscleStats.change < 0 }"
              >
                Изменение: {{ muscleStats.change > 0 ? '+' : '' }}{{ muscleStats.change }}%
              </p>
            </div>

            <div class="stat-card" v-if="tdeeStats.current">
              <h4>TDEE</h4>
              <p class="current">Текущий: {{ tdeeStats.current }} ккал</p>
              <p
                class="change"
                :class="{ positive: tdeeStats.change > 0, negative: tdeeStats.change < 0 }"
              >
                Изменение: {{ tdeeStats.change > 0 ? '+' : '' }}{{ tdeeStats.change }} ккал
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useFitnessStore } from '@/stores/fitness'
import { formatDate } from '@/utils/formatters'
import type { LineChartData, LineChartOptions } from '@/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const store = useFitnessStore()
const timeRange = ref('30')

const filteredMeasurements = computed(() => {
  const days = timeRange.value === 'all' ? Infinity : parseInt(timeRange.value)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  return store.measurements
    .filter((m) => new Date(m.date) >= cutoffDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

const weightChartData = computed<LineChartData>(() => ({
  labels: filteredMeasurements.value.map((m) => formatDate(m.date)),
  datasets: [
    {
      label: 'Вес (кг)',
      data: filteredMeasurements.value.map((m) => m.weight ?? null),
      borderColor: '#4CAF50',
      tension: 0.1,
    },
  ],
}))

const bodyCompositionChartData = computed<LineChartData>(() => ({
  labels: filteredMeasurements.value.map((m) => formatDate(m.date)),
  datasets: [
    {
      label: 'Жировая масса (%)',
      data: filteredMeasurements.value.map((m) => m.bodyFatPercentage ?? null),
      borderColor: '#FF5252',
      tension: 0.1,
      yAxisID: 'percentage',
    },
    {
      label: 'Мышечная масса (%)',
      data: filteredMeasurements.value.map((m) => m.musclePercentage ?? null),
      borderColor: '#2196F3',
      tension: 0.1,
      yAxisID: 'percentage',
    },
    {
      label: 'Костная масса (%)',
      data: filteredMeasurements.value.map((m) => m.bonePercentage ?? null),
      borderColor: '#4CAF50',
      tension: 0.1,
      yAxisID: 'percentage',
    },
    {
      label: 'Вода (%)',
      data: filteredMeasurements.value.map((m) => m.waterPercentage ?? null),
      borderColor: '#00BCD4',
      tension: 0.1,
      yAxisID: 'percentage',
    },
    {
      label: 'Жировая масса (кг)',
      data: filteredMeasurements.value.map((m) => m.bodyFatMass ?? null),
      borderColor: '#FF8A80',
      tension: 0.1,
      yAxisID: 'mass',
      hidden: true,
    },
    {
      label: 'Мышечная масса (кг)',
      data: filteredMeasurements.value.map((m) => m.muscleMass ?? null),
      borderColor: '#82B1FF',
      tension: 0.1,
      yAxisID: 'mass',
      hidden: true,
    },
    {
      label: 'Костная масса (кг)',
      data: filteredMeasurements.value.map((m) => m.boneMass ?? null),
      borderColor: '#69F0AE',
      tension: 0.1,
      yAxisID: 'mass',
      hidden: true,
    },
    {
      label: 'Вода (кг)',
      data: filteredMeasurements.value.map((m) => m.waterMass ?? null),
      borderColor: '#84FFFF',
      tension: 0.1,
      yAxisID: 'mass',
      hidden: true,
    },
  ].filter((dataset) => dataset.data.some((value) => value !== null)),
}))

const measurementsChartData = computed<LineChartData>(() => ({
  labels: filteredMeasurements.value.map((m) => formatDate(m.date)),
  datasets: [
    {
      label: 'Грудь (см)',
      data: filteredMeasurements.value.map((m) => m.measurements?.chest ?? null),
      borderColor: '#9C27B0',
      tension: 0.1,
    },
    {
      label: 'Талия (см)',
      data: filteredMeasurements.value.map((m) => m.measurements?.waist ?? null),
      borderColor: '#FF9800',
      tension: 0.1,
    },
    {
      label: 'Бедра (см)',
      data: filteredMeasurements.value.map((m) => m.measurements?.hips ?? null),
      borderColor: '#795548',
      tension: 0.1,
    },
  ].filter((dataset) => dataset.data.some((value) => value !== null)),
}))

const chartOptions: LineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
  scales: {
    percentage: {
      type: 'linear',
      position: 'left',
      min: 0,
      max: 100,
      title: {
        display: true,
        text: 'Процент (%)',
      },
      grid: {
        display: true,
        drawBorder: false,
      },
    },
    mass: {
      type: 'linear',
      position: 'right',
      min: 0,
      title: {
        display: true,
        text: 'Масса (кг)',
      },
      grid: {
        display: true,
        drawBorder: false,
      },
    },
  },
}

const calculateStats = (key: keyof (typeof filteredMeasurements.value)[0]) => {
  const measurements = filteredMeasurements.value
  if (measurements.length === 0) return { current: null, change: 0 }

  const current = measurements[measurements.length - 1][key]
  const first = measurements[0][key]

  if (typeof current === 'number' && typeof first === 'number') {
    return {
      current: Math.round(current * 10) / 10,
      change: Math.round((current - first) * 10) / 10,
    }
  }

  return { current: null, change: 0 }
}

const weightStats = computed(() => calculateStats('weight'))
const bodyFatStats = computed(() => calculateStats('bodyFatPercentage'))
const muscleStats = computed(() => calculateStats('musclePercentage'))
const tdeeStats = computed(() => calculateStats('tdee'))
</script>

<style scoped>
.analytics {
  padding: 1rem;
}

.chart-filters {
  margin-bottom: 2rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 1rem;
  box-shadow: var(--box-shadow);
  height: 400px;
  display: flex;
  flex-direction: column;
}

.chart-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--secondary-color);
  flex-shrink: 0;
}

.chart-container {
  position: relative;
  flex: 1;
  min-height: 300px;
  width: 100%;
}

.no-data {
  text-align: center;
  color: #666;
  padding: 2rem;
}

.statistics {
  margin-top: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 1rem;
  box-shadow: var(--box-shadow);
}

.stat-card h4 {
  margin: 0;
  color: var(--secondary-color);
}

.current {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.change {
  margin: 0;
  font-size: 0.9rem;
}

.change.positive {
  color: var(--primary-color);
}

.change.negative {
  color: #ff5252;
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
