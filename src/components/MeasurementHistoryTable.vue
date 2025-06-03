<template>
  <div class="measurement-history">
    <h3>История измерений</h3>
    
    <div class="actions">
      <button class="btn btn-danger" @click="clearAll">
        <span>🗑️</span>
        Очистить всю историю
      </button>
    </div>

    <div class="measurements-list" v-if="measurements.length">
      <div class="measurement-item" v-for="measurement in sortedMeasurements" :key="measurement.date">
        <div class="measurement-header">
          <h4>{{ formatDate(measurement.date) }}</h4>
          <div class="measurement-actions">
            <button class="btn btn-icon" @click="editMeasurement(measurement)" title="Редактировать">
              <span>✏️</span>
            </button>
            <button class="btn btn-icon" @click="deleteMeasurement(measurement.date)" title="Удалить">
              <span>🗑️</span>
            </button>
          </div>
        </div>

        <div class="measurement-details">
          <template v-if="props.type === 'weight' && measurement.weight !== undefined">
            <div class="detail-item">
              <span class="label">Вес:</span>
              <span class="value">{{ measurement.weight }} кг</span>
            </div>
          </template>

          <template v-if="props.type === 'body' && measurement.measurements">
            <div class="detail-item" v-for="(value, key) in measurement.measurements" :key="key">
              <span class="label">{{ getMeasurementLabel(key) }}:</span>
              <span class="value">{{ value }} см</span>
            </div>
          </template>

          <template v-if="props.type === 'composition'">
            <template v-if="measurement.bodyFatPercentage !== undefined">
              <div class="detail-item">
                <span class="label">Жир:</span>
                <span class="value">{{ measurement.bodyFatPercentage }}% ({{ measurement.bodyFatMass }} кг)</span>
              </div>
            </template>

            <template v-if="measurement.musclePercentage !== undefined">
              <div class="detail-item">
                <span class="label">Мышцы:</span>
                <span class="value">{{ measurement.musclePercentage }}% ({{ measurement.muscleMass }} кг)</span>
              </div>
            </template>

            <template v-if="measurement.waterPercentage !== undefined">
              <div class="detail-item">
                <span class="label">Вода:</span>
                <span class="value">{{ measurement.waterPercentage }}% ({{ measurement.waterMass }} кг)</span>
              </div>
            </template>
          </template>

          <template v-if="measurement.notes">
            <div class="notes">
              <p>{{ measurement.notes }}</p>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <p>История измерений пуста</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFitnessStore } from '@/stores/fitness';
import { formatDate, getMeasurementLabel } from '@/utils/formatters';
import type { MeasurementData } from '@/types';

const props = defineProps<{
  type: 'body' | 'weight' | 'composition';
}>();

const emit = defineEmits<{
  (e: 'edit', measurement: MeasurementData): void;
}>();

const store = useFitnessStore();

const measurements = computed(() => {
  switch (props.type) {
    case 'weight':
      return store.measurements.filter(m => m.weight !== undefined);
    case 'body':
      return store.measurements.filter(m => m.measurements !== undefined);
    case 'composition':
      return store.measurements.filter(m => 
        m.bodyFatPercentage !== undefined || 
        m.musclePercentage !== undefined || 
        m.waterPercentage !== undefined
      );
    default:
      return [];
  }
});

const sortedMeasurements = computed(() => {
  return [...measurements.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const deleteMeasurement = (date: string) => {
  if (confirm('Вы уверены, что хотите удалить это измерение?')) {
    store.deleteMeasurement(date);
  }
};

const editMeasurement = (measurement: MeasurementData) => {
  emit('edit', measurement);
};

const clearAll = () => {
  if (confirm('Вы уверены, что хотите очистить всю историю измерений?')) {
    store.clearAllData();
  }
};
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

.measurement-header h4 {
  margin: 0;
  color: var(--primary-color);
}

.measurement-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  transform: scale(1.1);
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