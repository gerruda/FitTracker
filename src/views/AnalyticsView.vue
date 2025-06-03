<template>
  <div class="analytics">
    <div class="container">
      <div class="card">
        <h2>Аналитика</h2>

        <div class="time-range">
          <label for="timeRange">Период:</label>
          <select v-model="timeRange" id="timeRange" class="form-control">
            <option value="7">Последние 7 дней</option>
            <option value="30">Последние 30 дней</option>
            <option value="90">Последние 3 месяца</option>
            <option value="180">Последние 6 месяцев</option>
            <option value="365">Последний год</option>
            <option value="all">Все время</option>
          </select>
        </div>

        <div class="charts">
          <div class="chart-container">
            <h3>Вес</h3>
            <Line
              v-if="weightChartData.datasets[0].data.length > 0"
              :data="weightChartData"
              :options="chartOptions"
            />
            <div v-else class="no-data">
              <p>Нет данных</p>
            </div>
          </div>

          <div class="chart-container">
            <h3>Состав тела</h3>
            <Line
              v-if="bodyCompositionChartData.datasets[0].data.length > 0"
              :data="bodyCompositionChartData"
              :options="chartOptions"
            />
            <div v-else class="no-data">
              <p>Нет данных</p>
            </div>
          </div>

          <div class="chart-container">
            <h3>Обхваты</h3>
            <Line
              v-if="measurementsChartData.datasets[0].data.length > 0"
              :data="measurementsChartData"
              :options="chartOptions"
            />
            <div v-else class="no-data">
              <p>Нет данных</p>
            </div>
          </div>
        </div>

        <div class="stats-grid">
          <template v-if="weightStats">
            <div class="stat-card">
              <h4>Вес</h4>
              <p class="current">Текущий: {{ weightStats.current }}кг</p>
              <p
                class="change"
                :class="{
                  positive: Number(weightStats.change) > 0,
                  negative: Number(weightStats.change) < 0,
                }"
              >
                Изменение: {{ Number(weightStats.change) > 0 ? '+' : '' }}{{ weightStats.change }}кг
              </p>
            </div>
          </template>

          <template v-if="bodyFatStats">
            <div class="stat-card">
              <h4>Жир</h4>
              <p class="current">Текущий: {{ bodyFatStats.current }}%</p>
              <p
                class="change"
                :class="{
                  positive: Number(bodyFatStats.change) < 0,
                  negative: Number(bodyFatStats.change) > 0,
                }"
              >
                Изменение: {{ Number(bodyFatStats.change) > 0 ? '+' : ''
                }}{{ bodyFatStats.change }}%
              </p>
            </div>
          </template>

          <template v-if="muscleStats">
            <div class="stat-card">
              <h4>Мышцы</h4>
              <p class="current">Текущая: {{ muscleStats.current }}%</p>
              <p
                class="change"
                :class="{
                  positive: Number(muscleStats.change) > 0,
                  negative: Number(muscleStats.change) < 0,
                }"
              >
                Изменение: {{ Number(muscleStats.change) > 0 ? '+' : '' }}{{ muscleStats.change }}%
              </p>
            </div>
          </template>

          <template v-if="tdeeStats">
            <div class="stat-card">
              <h4>TDEE</h4>
              <p class="current">Текущий: {{ tdeeStats.current }} ккал</p>
              <p
                class="change"
                :class="{
                  positive: Number(tdeeStats.change) > 0,
                  negative: Number(tdeeStats.change) < 0,
                }"
              >
                Изменение: {{ Number(tdeeStats.change) > 0 ? '+' : '' }}{{ tdeeStats.change }} ккал
              </p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFitnessStore } from '@/stores/fitness'
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
import { formatDate } from '@/utils/formatters'
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const store = useFitnessStore()
const timeRange = ref('30')

interface Stats {
  current: string
  change: string
}

const weightStats = computed<Stats | null>(() => {
  const measurements = getFilteredMeasurements()
  if (!measurements.length || !measurements[0].weight) return null

  const current = measurements[0].weight.toFixed(1)
  const firstWeight = measurements[measurements.length - 1].weight
  const change = firstWeight ? (measurements[0].weight - firstWeight).toFixed(1) : '0'

  return { current, change }
})

const bodyFatStats = computed<Stats | null>(() => {
  const measurements = getFilteredMeasurements()
  if (!measurements.length || !measurements[0].bodyFatPercentage) return null

  const current = measurements[0].bodyFatPercentage.toFixed(1)
  const firstBodyFat = measurements[measurements.length - 1].bodyFatPercentage
  const change = firstBodyFat ? (measurements[0].bodyFatPercentage - firstBodyFat).toFixed(1) : '0'

  return { current, change }
})

const muscleStats = computed<Stats | null>(() => {
  const measurements = getFilteredMeasurements()
  if (!measurements.length || !measurements[0].musclePercentage) return null

  const current = measurements[0].musclePercentage.toFixed(1)
  const firstMuscle = measurements[measurements.length - 1].musclePercentage
  const change = firstMuscle ? (measurements[0].musclePercentage - firstMuscle).toFixed(1) : '0'

  return { current, change }
})

const tdeeStats = computed<Stats | null>(() => {
  const measurements = getFilteredMeasurements()
  if (!measurements.length || !measurements[0].tdee) return null

  const current = measurements[0].tdee.toString()
  const firstTdee = measurements[measurements.length - 1].tdee
  const change = firstTdee ? (measurements[0].tdee - firstTdee).toString() : '0'

  return { current, change }
})

const getFilteredMeasurements = () => {
  const days = timeRange.value === 'all' ? Infinity : parseInt(timeRange.value)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  return store.measurements
    .filter((m) => new Date(m.date) >= cutoffDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

const chartOptions: ChartOptions<'line'> = {
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
        text: 'Процент',
      },
      grid: {
        display: true,
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
        display: false,
      },
    },
  },
}

const weightChartData = computed<ChartData<'line'>>(() => {
  const measurements = getFilteredMeasurements()
  const labels = measurements.map((m) => formatDate(m.date)).reverse()
  const data = measurements.map((m) => m.weight || null).reverse()

  return {
    labels,
    datasets: [
      {
        label: 'Вес (кг)',
        data,
        borderColor: '#4CAF50',
        tension: 0.1,
        yAxisID: 'mass',
      },
    ],
  }
})

const bodyCompositionChartData = computed<ChartData<'line'>>(() => {
  const measurements = getFilteredMeasurements()
  const labels = measurements.map((m) => formatDate(m.date)).reverse()
  const fatData = measurements.map((m) => m.bodyFatPercentage || null).reverse()
  const muscleData = measurements.map((m) => m.musclePercentage || null).reverse()
  const waterData = measurements.map((m) => m.waterPercentage || null).reverse()

  return {
    labels,
    datasets: [
      {
        label: 'Жир (%)',
        data: fatData,
        borderColor: '#FF5252',
        tension: 0.1,
        yAxisID: 'percentage',
      },
      {
        label: 'Мышцы (%)',
        data: muscleData,
        borderColor: '#2196F3',
        tension: 0.1,
        yAxisID: 'percentage',
      },
      {
        label: 'Вода (%)',
        data: waterData,
        borderColor: '#00BCD4',
        tension: 0.1,
        yAxisID: 'percentage',
      },
    ],
  }
})

const measurementsChartData = computed<ChartData<'line'>>(() => {
  const measurements = getFilteredMeasurements()
  const labels = measurements.map((m) => formatDate(m.date)).reverse()
  const chestData = measurements.map((m) => m.measurements?.chest || null).reverse()
  const waistData = measurements.map((m) => m.measurements?.waist || null).reverse()
  const hipsData = measurements.map((m) => m.measurements?.hips || null).reverse()

  return {
    labels,
    datasets: [
      {
        label: 'Грудь (см)',
        data: chestData,
        borderColor: '#9C27B0',
        tension: 0.1,
        yAxisID: 'mass',
      },
      {
        label: 'Талия (см)',
        data: waistData,
        borderColor: '#FF9800',
        tension: 0.1,
        yAxisID: 'mass',
      },
      {
        label: 'Бёдра (см)',
        data: hipsData,
        borderColor: '#795548',
        tension: 0.1,
        yAxisID: 'mass',
      },
    ],
  }
})
</script>

<style scoped>
.analytics {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.container {
  display: grid;
  gap: 2rem;
  margin: 2rem 0;
}

.card {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.card h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.time-range {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--text-muted);
  font-weight: 500;
}

.form-group select {
  padding: 0.5rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  background: white;
  min-width: 150px;
}

.charts {
  display: grid;
  gap: 2rem;
}

.chart-container {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.chart-container h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  background: var(--bg-light);
  border-radius: var(--border-radius);
}

.stats-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.stat-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 1rem;
  box-shadow: var(--shadow-sm);
}

.stat-card h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.current {
  margin: 0;
}

.change {
  margin: 0;
  font-size: 0.875rem;
}

.positive {
  color: var(--success-color);
}

.negative {
  color: var(--danger-color);
}

.data-management-section {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-top: 2rem;
}

.data-management-section h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

.data-management-actions {
  display: grid;
  gap: 2rem;
}

.action-group {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.action-group h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--text-muted);
}

.button-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn span {
  font-size: 1.2em;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  background: var(--danger-dark);
}

.danger-zone {
  border: 1px solid var(--danger-color);
}

.import-btn {
  position: relative;
  overflow: hidden;
}

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}

.filter-section {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-section label {
  color: var(--text-muted);
  font-weight: 500;
}

.filter-section select {
  padding: 0.5rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  background: white;
  min-width: 150px;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  background: white;
  border-radius: var(--border-radius);
  margin-top: 1rem;
}
</style>
