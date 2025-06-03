<template>
  <div class="measurement-history">
    <div class="container">
      <div class="card">
        <h2>История измерений</h2>

        <div class="actions">
          <button class="btn btn-danger" @click="clearHistory">Очистить историю</button>
        </div>

        <div class="history-list">
          <template v-if="store.measurements.length">
            <div
              class="measurement-item"
              v-for="measurement in store.measurements"
              :key="measurement.date"
            >
              <div class="measurement-header">
                <div class="measurement-info">
                  <h4>{{ formatDate(measurement.date) }}</h4>
                </div>
                <div class="measurement-actions">
                  <button
                    class="btn btn-icon"
                    @click="editMeasurement(measurement)"
                    title="Редактировать"
                  >
                    <span>✏️</span>
                  </button>
                  <button
                    class="btn btn-icon"
                    @click="deleteMeasurement(measurement.date)"
                    title="Удалить"
                  >
                    <span>🗑️</span>
                  </button>
                </div>
              </div>

              <div class="measurement-details">
                <template v-if="measurement.weight">
                  <div class="detail-item">
                    <span class="label">Вес:</span>
                    <span class="value">{{ measurement.weight }} кг</span>
                  </div>
                </template>

                <template v-if="measurement.bodyFatPercentage">
                  <div class="detail-item">
                    <span class="label">Жир:</span>
                    <span class="value">{{ measurement.bodyFatPercentage }}%</span>
                  </div>
                </template>

                <template v-if="measurement.musclePercentage">
                  <div class="detail-item">
                    <span class="label">Мышцы:</span>
                    <span class="value">{{ measurement.musclePercentage }}%</span>
                  </div>
                </template>

                <template v-if="measurement.waterPercentage">
                  <div class="detail-item">
                    <span class="label">Вода:</span>
                    <span class="value">{{ measurement.waterPercentage }}%</span>
                  </div>
                </template>

                <template v-if="measurement.measurements">
                  <div
                    class="detail-item"
                    v-for="(value, key) in measurement.measurements"
                    :key="key"
                  >
                    <span class="label">{{ getMeasurementLabel(key) }}:</span>
                    <span class="value">{{ value }} см</span>
                  </div>
                </template>

                <template v-if="measurement.notes">
                  <div class="detail-item">
                    <span class="label">Примечания:</span>
                    <span class="value">{{ measurement.notes }}</span>
                  </div>
                </template>
              </div>
            </div>
          </template>
          <div v-else class="empty-state">
            <p>Нет записей</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFitnessStore } from '@/stores/fitness'
import type { MeasurementData } from '@/types'
import { formatDate } from '@/utils/formatters'

const store = useFitnessStore()

const clearHistory = () => {
  if (confirm('Вы уверены, что хотите удалить всю историю измерений?')) {
    store.clearMeasurements()
  }
}

const deleteMeasurement = (date: string) => {
  if (confirm('Вы уверены, что хотите удалить это измерение?')) {
    store.deleteMeasurement(date)
  }
}

const editMeasurement = (measurement: MeasurementData) => {
  store.setEditingMeasurement(measurement)
}

const getMeasurementLabel = (key: string): string => {
  const labels: Record<string, string> = {
    chest: 'Грудь',
    waist: 'Талия',
    hips: 'Бедра',
    arms: 'Бицепс',
    forearms: 'Предплечье',
    thighs: 'Бедро',
    calves: 'Голень',
    neck: 'Шея',
  }
  return labels[key] || key
}
</script>

<style scoped>
.measurement-history {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.actions {
  margin-bottom: 2rem;
  display: flex;
  justify-content: flex-end;
}

.measurements-list {
  display: grid;
  gap: 1.5rem;
}

.measurement-item {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.measurement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.measurement-header h3 {
  margin: 0;
  color: var(--primary-color);
}

.btn-icon {
  padding: 0.5rem;
  color: var(--danger-color);
  background: none;
  border: none;
}

.btn-icon:hover {
  background: var(--danger-color-light);
}

.measurement-details {
  display: grid;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-item:last-child {
  border-bottom: none;
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
}

.notes p {
  margin: 0;
  color: var(--text-muted);
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

@media (max-width: 480px) {
  .measurement-item {
    padding: 1rem;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
