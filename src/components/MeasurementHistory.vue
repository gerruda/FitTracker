<template>
  <div class="measurement-history">
    <h2>История измерений</h2>
    
    <div class="actions">
      <button class="btn btn-danger" @click="clearAll">
        <span class="mdi mdi-delete-sweep"></span>
        Очистить всю историю
      </button>
    </div>

    <div class="measurements-list" v-if="store.sortedMeasurements.length">
      <div class="measurement-item" v-for="measurement in store.sortedMeasurements" :key="measurement.date">
        <div class="measurement-header">
          <h3>{{ formatDate(measurement.date) }}</h3>
          <button class="btn btn-icon" @click="deleteMeasurement(measurement.date)">
            <span class="mdi mdi-delete"></span>
          </button>
        </div>

        <div class="measurement-details">
          <div class="detail-item">
            <span class="label">Вес:</span>
            <span class="value">{{ measurement.weight }} кг</span>
          </div>

          <template v-if="measurement.bodyFatPercentage">
            <div class="detail-item">
              <span class="label">Жир:</span>
              <span class="value">{{ measurement.bodyFatPercentage }}% ({{ measurement.bodyFatMass }} кг)</span>
            </div>
          </template>

          <template v-if="measurement.musclePercentage">
            <div class="detail-item">
              <span class="label">Мышцы:</span>
              <span class="value">{{ measurement.musclePercentage }}% ({{ measurement.muscleMass }} кг)</span>
            </div>
          </template>

          <template v-if="measurement.waterPercentage">
            <div class="detail-item">
              <span class="label">Вода:</span>
              <span class="value">{{ measurement.waterPercentage }}% ({{ measurement.waterMass }} кг)</span>
            </div>
          </template>

          <template v-if="measurement.bonePercentage">
            <div class="detail-item">
              <span class="label">Кости:</span>
              <span class="value">{{ measurement.bonePercentage }}% ({{ measurement.boneMass }} кг)</span>
            </div>
          </template>

          <template v-if="measurement.tdee">
            <div class="detail-item">
              <span class="label">TDEE:</span>
              <span class="value">{{ measurement.tdee }} ккал</span>
            </div>
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
import { useFitnessStore } from '@/stores/fitness';

const store = useFitnessStore();

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

const deleteMeasurement = (date: string) => {
  if (confirm('Вы уверены, что хотите удалить это измерение?')) {
    store.deleteMeasurement(date);
  }
};

const clearAll = () => {
  store.clearAllMeasurements();
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