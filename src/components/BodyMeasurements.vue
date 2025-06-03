<template>
  <div class="body-measurements">
    <div class="card">
      <h2>Измерения тела</h2>

      <form @submit.prevent="saveMeasurements" class="measurement-form">
        <div class="form-group">
          <label for="date">Дата</label>
          <input 
            type="date" 
            id="date" 
            v-model="measurementData.date" 
            class="form-control"
            required
          >
        </div>

        <div class="measurements-section">
          <h3>Обхваты тела</h3>
          
          <div class="form-group">
            <label for="chest">{{ getMeasurementLabel('chest') }} (см)</label>
            <input 
              type="number" 
              id="chest" 
              v-model="measurementData.measurements.chest" 
              class="form-control"
              step="0.1"
            >
          </div>

          <div class="form-group">
            <label for="waist">{{ getMeasurementLabel('waist') }} (см)</label>
            <input 
              type="number" 
              id="waist" 
              v-model="measurementData.measurements.waist" 
              class="form-control"
              step="0.1"
            >
          </div>

          <div class="form-group">
            <label for="hips">{{ getMeasurementLabel('hips') }} (см)</label>
            <input 
              type="number" 
              id="hips" 
              v-model="measurementData.measurements.hips" 
              class="form-control"
              step="0.1"
            >
          </div>

          <div class="form-group">
            <label for="arms">{{ getMeasurementLabel('arms') }} (см)</label>
            <input 
              type="number" 
              id="arms" 
              v-model="measurementData.measurements.arms" 
              class="form-control"
              step="0.1"
            >
          </div>

          <div class="form-group">
            <label for="forearms">{{ getMeasurementLabel('forearms') }} (см)</label>
            <input 
              type="number" 
              id="forearms" 
              v-model="measurementData.measurements.forearms" 
              class="form-control"
              step="0.1"
            >
          </div>

          <div class="form-group">
            <label for="thighs">{{ getMeasurementLabel('thighs') }} (см)</label>
            <input 
              type="number" 
              id="thighs" 
              v-model="measurementData.measurements.thighs" 
              class="form-control"
              step="0.1"
            >
          </div>

          <div class="form-group">
            <label for="calves">{{ getMeasurementLabel('calves') }} (см)</label>
            <input 
              type="number" 
              id="calves" 
              v-model="measurementData.measurements.calves" 
              class="form-control"
              step="0.1"
            >
          </div>

          <div class="form-group">
            <label for="neck">{{ getMeasurementLabel('neck') }} (см)</label>
            <input 
              type="number" 
              id="neck" 
              v-model="measurementData.measurements.neck" 
              class="form-control"
              step="0.1"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="notes">Примечания</label>
          <textarea 
            id="notes" 
            v-model="measurementData.notes" 
            class="form-control"
            placeholder="Дополнительные заметки об измерениях"
          ></textarea>
        </div>

        <button type="submit" class="btn btn-primary">Сохранить измерения</button>
      </form>
    </div>

    <MeasurementHistoryTable type="body" @edit="handleEdit" />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { useFitnessStore } from '@/stores/fitness';
import MeasurementHistoryTable from './MeasurementHistoryTable.vue';
import { getMeasurementLabel } from '@/utils/formatters';
import type { MeasurementData } from '@/types';

const store = useFitnessStore();

const measurementData = reactive({
  date: new Date().toISOString().split('T')[0],
  measurements: {
    chest: undefined as number | undefined,
    waist: undefined as number | undefined,
    hips: undefined as number | undefined,
    arms: undefined as number | undefined,
    forearms: undefined as number | undefined,
    thighs: undefined as number | undefined,
    calves: undefined as number | undefined,
    neck: undefined as number | undefined,
  },
  notes: '',
});

onMounted(() => {
  // Если есть измерение для редактирования, заполняем форму
  if (store.editingMeasurement) {
    const measurement = store.editingMeasurement;
    measurementData.date = measurement.date.split('T')[0];
    if (measurement.measurements) {
      Object.keys(measurement.measurements).forEach(key => {
        measurementData.measurements[key as keyof typeof measurementData.measurements] = 
          measurement.measurements[key as keyof typeof measurement.measurements];
      });
    }
    measurementData.notes = measurement.notes || '';
    // Очищаем редактируемое измерение
    store.setEditingMeasurement(null);
  }
});

const saveMeasurements = () => {
  // Проверяем, есть ли хотя бы одно измерение
  const hasAnyMeasurement = Object.values(measurementData.measurements).some(value => value !== undefined);
  
  if (hasAnyMeasurement) {
    // Фильтруем undefined значения
    const measurements = Object.entries(measurementData.measurements).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key as keyof typeof measurementData.measurements] = value;
      }
      return acc;
    }, {} as typeof measurementData.measurements);

    store.addMeasurement({
      date: measurementData.date,
      measurements: measurements,
      notes: measurementData.notes,
    });

    // Сброс формы
    Object.keys(measurementData.measurements).forEach(key => {
      measurementData.measurements[key as keyof typeof measurementData.measurements] = undefined;
    });
    measurementData.notes = '';
    measurementData.date = new Date().toISOString().split('T')[0];
  }
};

const handleEdit = (measurement: MeasurementData) => {
  if (measurement.measurements) {
    Object.keys(measurementData).forEach(key => {
      const typedKey = key as keyof typeof measurementData;
      measurementData[typedKey] = measurement.measurements?.[typedKey] || 0;
    });
  }
};
</script>

<style scoped>
.body-measurements {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.measurements-section {
  background: #f8f9fa;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.measurements-section h3 {
  color: var(--secondary-color);
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

textarea.form-control {
  min-height: 100px;
  resize: vertical;
}
</style> 