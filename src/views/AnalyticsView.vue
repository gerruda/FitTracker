<template>
  <div class="analytics-view">
    <h2>Аналитика</h2>

    <div class="charts-container">
      <div class="chart-section">
        <h3>Вес</h3>
        <div class="chart-wrapper">
          <template v-if="weightChartData.datasets[0]?.data.length > 0">
            <line-chart
              :data="weightChartData"
              :options="weightChartOptions"
              class="chart"
            />
          </template>
          <div v-else class="no-data">
            <p>Нет данных для отображения</p>
          </div>
        </div>
      </div>

      <div class="chart-section">
        <h3>Состав тела</h3>
        <div class="chart-wrapper">
          <template v-if="bodyCompositionData.datasets[0]?.data.length > 0">
            <line-chart
              :data="bodyCompositionData"
              :options="bodyCompositionOptions"
              class="chart"
            />
          </template>
          <div v-else class="no-data">
            <p>Нет данных для отображения</p>
          </div>
        </div>
      </div>

      <div class="chart-section">
        <h3>Оценка состава тела</h3>
        <div class="chart-wrapper">
          <template v-if="scoreData.datasets[0]?.data.length > 0">
            <line-chart
              :data="scoreData"
              :options="scoreOptions"
              class="chart"
            />
          </template>
          <div v-else class="no-data">
            <p>Нет данных для отображения</p>
          </div>
        </div>
      </div>

      <div class="chart-section">
        <h3>Замеры тела</h3>
        <div class="chart-wrapper">
          <template v-if="bodyMeasurementsData.datasets[0]?.data.length > 0">
            <line-chart
              :data="bodyMeasurementsData"
              :options="bodyMeasurementsOptions"
              class="chart"
            />
          </template>
          <div v-else class="no-data">
            <p>Нет данных для отображения</p>
          </div>
        </div>
      </div>
    </div>

    <div class="statistics">
      <h3>Статистика</h3>
      
      <div class="stats-grid">
        <div class="stat-card" v-if="weightStats">
          <h4>Вес</h4>
          <p class="current">Текущий: {{ weightStats.current }}кг</p>
          <p class="change" :class="{ positive: weightStats.change > 0, negative: weightStats.change < 0 }">
            Изменение: {{ weightStats.change > 0 ? '+' : ''}}{{ weightStats.change }}кг
          </p>
        </div>

        <div class="stat-card" v-if="bodyFatStats">
          <h4>Процент жира</h4>
          <p class="current">Текущий: {{ bodyFatStats.current }}%</p>
          <p class="change" :class="{ positive: bodyFatStats.change < 0, negative: bodyFatStats.change > 0 }">
            Изменение: {{ bodyFatStats.change > 0 ? '+' : ''}}{{ bodyFatStats.change }}%
          </p>
        </div>

        <div class="stat-card" v-if="muscleStats">
          <h4>Мышечная масса</h4>
          <p class="current">Текущая: {{ muscleStats.current }}%</p>
          <p class="change" :class="{ positive: muscleStats.change > 0, negative: muscleStats.change < 0 }">
            Изменение: {{ muscleStats.change > 0 ? '+' : ''}}{{ muscleStats.change }}%
          </p>
        </div>

        <div class="stat-card" v-if="tdeeStats">
          <h4>TDEE</h4>
          <p class="current">Текущий: {{ tdeeStats.current }} ккал</p>
          <p class="change" :class="{ positive: tdeeStats.change > 0, negative: tdeeStats.change < 0 }">
            Изменение: {{ tdeeStats.change > 0 ? '+' : ''}}{{ tdeeStats.change }} ккал
          </p>
        </div>
      </div>
    </div>

    <div class="history-section">
      <h3>История измерений</h3>
      
      <!-- Добавляем фильтр по времени -->
      <div class="filter-section">
        <label for="timeRange">Показать за период:</label>
        <select v-model="timeRange" id="timeRange" class="form-control">
          <option value="7">Неделя</option>
          <option value="30">Месяц</option>
          <option value="90">3 месяца</option>
          <option value="180">6 месяцев</option>
          <option value="365">Год</option>
          <option value="-1">Все время</option>
        </select>
      </div>

      <div class="history-list" v-if="filteredMeasurements.length">
        <div class="history-item" v-for="measurement in filteredMeasurements" :key="measurement.date">
          <div class="history-header">
            <div class="header-info">
              <h4>{{ formatDate(measurement.date) }}</h4>
              <div class="measurement-types">
                <span v-for="type in getMeasurementTypes(measurement)" 
                      :key="type" 
                      :class="['type-badge', type]">
                  {{ type === 'weight' ? 'Вес' : type === 'body' ? 'Замеры' : 'Состав' }}
                </span>
              </div>
            </div>
            <div class="history-actions">
              <button class="btn btn-icon" @click="editMeasurement(measurement)" title="Редактировать">
                <span>✏️</span>
              </button>
              <button class="btn btn-icon" @click="deleteMeasurement(measurement.date)" title="Удалить">
                <span>🗑️</span>
              </button>
            </div>
          </div>

          <div class="history-details">
            <!-- Вес -->
            <div v-if="measurement.weight !== undefined" class="measurement-section">
              <h5>Вес</h5>
              <div class="detail-item">
                <span class="value">{{ measurement.weight }} кг</span>
              </div>
            </div>

            <!-- Замеры тела -->
            <div v-if="measurement.measurements" class="measurement-section">
              <h5>Замеры тела</h5>
              <div class="detail-grid">
                <template v-for="(value, key) in measurement.measurements" :key="key">
                  <div class="detail-item" v-if="value !== undefined">
                    <span class="label">{{ getMeasurementLabel(key) }}:</span>
                    <span class="value">{{ value }} см</span>
                  </div>
                </template>
              </div>
            </div>

            <!-- Состав тела -->
            <div v-if="hasCompositionData(measurement)" class="measurement-section">
              <h5>Состав тела</h5>
              <div class="detail-grid">
                <div class="detail-item" v-if="measurement.bodyFatPercentage !== undefined">
                  <span class="label">Жир:</span>
                  <span class="value">{{ measurement.bodyFatPercentage }}% ({{ measurement.bodyFatMass }} кг)</span>
                </div>
                <div class="detail-item" v-if="measurement.musclePercentage !== undefined">
                  <span class="label">Мышцы:</span>
                  <span class="value">{{ measurement.musclePercentage }}% ({{ measurement.muscleMass }} кг)</span>
                </div>
                <div class="detail-item" v-if="measurement.waterPercentage !== undefined">
                  <span class="label">Вода:</span>
                  <span class="value">{{ measurement.waterPercentage }}% ({{ measurement.waterMass }} кг)</span>
                </div>
              </div>
            </div>

            <!-- Примечания -->
            <div v-if="measurement.notes" class="notes">
              <p>{{ measurement.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <p>Нет данных за выбранный период</p>
      </div>
    </div>

    <!-- Добавляем секцию управления данными -->
    <div class="data-management-section">
      <h3>Управление данными</h3>
      <div class="data-management-actions">
        <div class="action-group">
          <h4>Экспорт/Импорт</h4>
          <div class="button-group">
            <button class="btn btn-primary" @click="exportData">
              <span>📤</span>
              Экспортировать данные
            </button>
            <label class="btn btn-primary import-btn">
              <span>📥</span>
              Импортировать данные
              <input 
                type="file" 
                accept=".json"
                @change="handleFileImport" 
                style="display: none;"
              >
            </label>
          </div>
        </div>

        <div class="action-group danger-zone">
          <h4>Опасная зона</h4>
          <button class="btn btn-danger" @click="clearAllData">
            <span>🗑️</span>
            Очистить все данные
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFitnessStore } from '@/stores/fitness';
import { Line as LineChart } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useRouter } from 'vue-router';
import type { MeasurementData } from '@/types';
import type { FitnessChartData, FitnessChartOptions } from '@/types/chart';
import { defaultChartOptions } from '@/types/chart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const store = useFitnessStore();
const router = useRouter();
const timeRange = ref('30');

// Добавляем вычисляемые свойства для статистики
const weightStats = computed(() => {
  const measurements = store.sortedMeasurements.filter(m => m.weight !== undefined && m.weight !== null);
  if (measurements.length === 0) return null;

  const current = measurements[0].weight;
  const previous = measurements.length > 1 ? measurements[measurements.length - 1].weight : current;
  
  if (current === undefined || current === null) return null;
  
  return {
    current: current.toFixed(1),
    change: previous ? (current - previous).toFixed(1) : '0'
  };
});

const bodyFatStats = computed(() => {
  const measurements = store.sortedMeasurements.filter(m => 
    m.bodyFatPercentage !== undefined && m.bodyFatPercentage !== null
  );
  if (measurements.length === 0) return null;

  const current = measurements[0].bodyFatPercentage;
  const previous = measurements.length > 1 ? measurements[measurements.length - 1].bodyFatPercentage : current;
  
  if (current === undefined || current === null) return null;
  
  return {
    current: current.toFixed(1),
    change: previous ? (current - previous).toFixed(1) : '0'
  };
});

const muscleStats = computed(() => {
  const measurements = store.sortedMeasurements.filter(m => 
    m.musclePercentage !== undefined && m.musclePercentage !== null
  );
  if (measurements.length === 0) return null;

  const current = measurements[0].musclePercentage;
  const previous = measurements.length > 1 ? measurements[measurements.length - 1].musclePercentage : current;
  
  if (current === undefined || current === null) return null;
  
  return {
    current: current.toFixed(1),
    change: previous ? (current - previous).toFixed(1) : '0'
  };
});

const tdeeStats = computed(() => {
  const measurements = store.sortedMeasurements.filter(m => m.tdee !== undefined && m.tdee !== null);
  if (measurements.length === 0) return null;

  const current = measurements[0].tdee;
  const previous = measurements.length > 1 ? measurements[measurements.length - 1].tdee : current;
  
  if (current === undefined || current === null) return null;
  
  return {
    current,
    change: previous ? current - previous : 0
  };
});

onMounted(() => {
  store.loadFromStorage();
});

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getMeasurementLabel = (key: string): string => {
  const labels: Record<string, string> = {
    chest: 'Грудь',
    waist: 'Талия',
    hips: 'Бедра',
    arms: 'Бицепс',
    forearms: 'Предплечье',
    thighs: 'Бедро',
    calves: 'Голень',
    neck: 'Шея'
  };
  return labels[key] || key;
};

const getMeasurementTypes = (measurement: MeasurementData): string[] => {
  const types: string[] = [];
  if (measurement.weight !== undefined) types.push('weight');
  if (measurement.measurements) types.push('body');
  if (hasCompositionData(measurement)) types.push('composition');
  return types;
};

const hasCompositionData = (measurement: MeasurementData): boolean => {
  return measurement.bodyFatPercentage !== undefined ||
         measurement.musclePercentage !== undefined ||
         measurement.waterPercentage !== undefined ||
         measurement.bodyFatMass !== undefined ||
         measurement.muscleMass !== undefined ||
         measurement.waterMass !== undefined;
};

const deleteMeasurement = (date: string) => {
  if (confirm('Вы уверены, что хотите удалить это измерение?')) {
    store.deleteMeasurement(date);
  }
};

const editMeasurement = (measurement: MeasurementData) => {
  if (hasCompositionData(measurement)) {
    router.push('/measurements/composition');
  } else if (measurement.measurements) {
    router.push('/measurements/body');
  } else if (measurement.weight !== undefined) {
    router.push('/measurements/weight');
  }
  store.setEditingMeasurement(measurement);
};

const weightChartData = computed<FitnessChartData>(() => ({
  labels: filteredMeasurements.value.map(m => formatDate(m.date)),
  datasets: [{
    label: 'Вес',
    data: filteredMeasurements.value.map(m => m.weight ?? null),
    borderColor: '#42b883',
    tension: 0.4
  }]
}));

const bodyMeasurementsData = computed<FitnessChartData>(() => ({
  labels: filteredMeasurements.value.map(m => formatDate(m.date)),
  datasets: [
    {
      label: 'Грудь',
      data: filteredMeasurements.value.map(m => m.measurements?.chest ?? null),
      borderColor: '#e91e63',
      tension: 0.4,
      fill: true
    },
    {
      label: 'Талия',
      data: filteredMeasurements.value.map(m => m.measurements?.waist ?? null),
      borderColor: '#9c27b0',
      tension: 0.4,
      fill: true
    },
    {
      label: 'Бедра',
      data: filteredMeasurements.value.map(m => m.measurements?.hips ?? null),
      borderColor: '#673ab7',
      tension: 0.4,
      fill: true
    }
  ]
}));

const bodyCompositionData = computed<FitnessChartData>(() => ({
  labels: filteredMeasurements.value.map(m => formatDate(m.date)),
  datasets: [
    {
      label: 'Жир (%)',
      data: filteredMeasurements.value.map(m => m.bodyFatPercentage ?? null),
      borderColor: '#ff7043',
      tension: 0.4,
      fill: true
    },
    {
      label: 'Мышцы (%)',
      data: filteredMeasurements.value.map(m => m.musclePercentage ?? null),
      borderColor: '#42a5f5',
      tension: 0.4,
      fill: true
    },
    {
      label: 'Вода (%)',
      data: filteredMeasurements.value.map(m => m.waterPercentage ?? null),
      borderColor: '#26c6da',
      tension: 0.4,
      fill: true
    }
  ]
}));

const scoreData = computed<FitnessChartData>(() => ({
  labels: filteredMeasurements.value.map(m => formatDate(m.date)),
  datasets: [
    {
      label: 'BMI',
      data: filteredMeasurements.value.map(m => m.bmi ?? null),
      borderColor: '#ab47bc',
      tension: 0.4,
      fill: true,
      yAxisID: 'bmi'
    },
    {
      label: 'Общий балл',
      data: filteredMeasurements.value.map(m => m.totalScore ?? null),
      borderColor: '#66bb6a',
      tension: 0.4,
      fill: true,
      yAxisID: 'score'
    },
    {
      label: 'Висцеральный жир',
      data: filteredMeasurements.value.map(m => m.visceralFat ?? null),
      borderColor: '#ffa726',
      tension: 0.4,
      fill: true,
      yAxisID: 'visceral'
    }
  ]
}));

const weightChartOptions = computed<FitnessChartOptions>(() => ({
  ...defaultChartOptions,
  scales: {
    y: {
      title: {
        display: true,
        text: 'Вес (кг)'
      },
      min: Math.min(...filteredMeasurements.value.map(m => m.weight ?? Infinity)) - 1,
      max: Math.max(...filteredMeasurements.value.map(m => m.weight ?? -Infinity)) + 1
    }
  }
}));

const bodyMeasurementsOptions = computed<FitnessChartOptions>(() => ({
  ...defaultChartOptions,
  scales: {
    y: {
      title: {
        display: true,
        text: 'Сантиметры'
      }
    }
  }
}));

const bodyCompositionOptions = computed<FitnessChartOptions>(() => ({
  ...defaultChartOptions,
  scales: {
    y: {
      title: {
        display: true,
        text: 'Процент (%)'
      },
      min: 0,
      max: 100
    }
  }
}));

const scoreOptions = computed<FitnessChartOptions>(() => ({
  ...defaultChartOptions,
  scales: {
    bmi: {
      type: 'linear' as const,
      position: 'left' as const,
      title: {
        display: true,
        text: 'BMI'
      },
      min: 15,
      max: 35
    },
    score: {
      type: 'linear' as const,
      position: 'right' as const,
      title: {
        display: true,
        text: 'Общий балл'
      },
      min: 0,
      max: 100
    },
    visceral: {
      type: 'linear' as const,
      position: 'right' as const,
      title: {
        display: true,
        text: 'Висцеральный жир'
      },
      min: 0,
      max: 20
    }
  }
}));

const filteredMeasurements = computed(() => {
  const days = parseInt(timeRange.value);
  const now = new Date();
  const cutoff = new Date(now.setDate(now.getDate() - (days === -1 ? 36500 : days)));
  
  return [...store.measurements]
    .filter(m => new Date(m.date) >= cutoff)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

// Функции управления данными
const exportData = () => {
  const data = store.exportData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fittracker-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const handleFileImport = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target?.result as string;
    if (content) {
      const success = store.importData(content);
      if (success) {
        alert('Данные успешно импортированы');
      } else {
        alert('Ошибка при импорте данных. Проверьте формат файла.');
      }
    }
  };

  reader.readAsText(file);
  // Очищаем input для возможности повторного импорта того же файла
  input.value = '';
};

const clearAllData = () => {
  if (confirm('Вы уверены, что хотите удалить ВСЕ данные? Это действие нельзя отменить!')) {
    store.clearAllData();
    alert('Все данные удалены');
  }
};
</script>

<style scoped>
.analytics-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.charts-container {
  display: grid;
  gap: 2rem;
  margin: 2rem 0;
}

.chart-section {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.chart-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.chart-wrapper {
  height: 300px;
  position: relative;
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

.statistics {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
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

.history-section {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-top: 2rem;
}

.history-list {
  display: grid;
  gap: 1.5rem;
}

.history-item {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.header-info h4 {
  margin: 0;
  color: var(--primary-color);
}

.measurement-types {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.type-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-weight: 500;
}

.type-badge.weight {
  background: #e3f2fd;
  color: #1976d2;
}

.type-badge.body {
  background: #f3e5f5;
  color: #9c27b0;
}

.type-badge.composition {
  background: #e8f5e9;
  color: #4caf50;
}

.history-actions {
  display: flex;
  gap: 0.5rem;
}

.measurement-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: var(--border-radius);
}

.measurement-section:last-child {
  margin-bottom: 0;
}

.measurement-section h5 {
  margin: 0 0 0.75rem 0;
  color: var(--text-muted);
  font-weight: 500;
}

.detail-grid {
  display: grid;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: var(--text-muted);
}

.value {
  font-weight: 500;
}

.notes {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  font-style: italic;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .chart-wrapper {
    height: 250px;
  }
  
  .history-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .history-actions {
    align-self: flex-end;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
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