<template>
  <div class="body-measurements">
    <div class="card">
      <h2>Измерения тела</h2>

      <form @submit.prevent="handleSubmit" class="measurement-form">
        <div class="form-group">
          <label for="date">Дата</label>
          <input
            type="date"
            id="date"
            v-model="measurementData.date"
            class="form-control"
            required
          />
        </div>

        <div class="measurements-section">
          <h3>Обхваты тела</h3>

          <div class="form-group">
            <label for="chest">{{ getMeasurementLabel('chest') }} (см)</label>
            <input
              type="number"
              id="chest"
              v-model="measurementData.chest"
              class="form-control"
              step="0.1"
            />
          </div>

          <div class="form-group">
            <label for="waist">{{ getMeasurementLabel('waist') }} (см)</label>
            <input
              type="number"
              id="waist"
              v-model="measurementData.waist"
              class="form-control"
              step="0.1"
            />
          </div>

          <div class="form-group">
            <label for="hips">{{ getMeasurementLabel('hips') }} (см)</label>
            <input
              type="number"
              id="hips"
              v-model="measurementData.hips"
              class="form-control"
              step="0.1"
            />
          </div>

          <div class="form-group">
            <label for="arms">{{ getMeasurementLabel('arms') }} (см)</label>
            <input
              type="number"
              id="arms"
              v-model="measurementData.arms"
              class="form-control"
              step="0.1"
            />
          </div>

          <div class="form-group">
            <label for="forearms">{{ getMeasurementLabel('forearms') }} (см)</label>
            <input
              type="number"
              id="forearms"
              v-model="measurementData.forearms"
              class="form-control"
              step="0.1"
            />
          </div>

          <div class="form-group">
            <label for="thighs">{{ getMeasurementLabel('thighs') }} (см)</label>
            <input
              type="number"
              id="thighs"
              v-model="measurementData.thighs"
              class="form-control"
              step="0.1"
            />
          </div>

          <div class="form-group">
            <label for="calves">{{ getMeasurementLabel('calves') }} (см)</label>
            <input
              type="number"
              id="calves"
              v-model="measurementData.calves"
              class="form-control"
              step="0.1"
            />
          </div>

          <div class="form-group">
            <label for="neck">{{ getMeasurementLabel('neck') }} (см)</label>
            <input
              type="number"
              id="neck"
              v-model="measurementData.neck"
              class="form-control"
              step="0.1"
            />
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
import { ref, onMounted } from 'vue'
import { useFitnessStore } from '@/stores/fitness'
import MeasurementHistoryTable from './MeasurementHistoryTable.vue'
import { getMeasurementLabel } from '@/utils/formatters'
import type { MeasurementData } from '@/types'

const store = useFitnessStore()

interface MeasurementFields {
  chest: number
  waist: number
  hips: number
  arms: number
  forearms: number
  thighs: number
  calves: number
  neck: number
}

interface MeasurementFormData extends MeasurementFields {
  date: string
  notes: string
}

const measurementData = ref<MeasurementFormData>({
  chest: 0,
  waist: 0,
  hips: 0,
  arms: 0,
  forearms: 0,
  thighs: 0,
  calves: 0,
  neck: 0,
  date: new Date().toISOString().split('T')[0],
  notes: '',
})

const resetForm = () => {
  const defaultData: MeasurementFormData = {
    chest: 0,
    waist: 0,
    hips: 0,
    arms: 0,
    forearms: 0,
    thighs: 0,
    calves: 0,
    neck: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  }
  measurementData.value = defaultData
}

const handleSubmit = () => {
  const measurement: MeasurementData = {
    date: measurementData.value.date,
    notes: measurementData.value.notes,
    measurements: {},
  }

  const measurementFields: Array<keyof MeasurementFields> = [
    'chest',
    'waist',
    'hips',
    'arms',
    'forearms',
    'thighs',
    'calves',
    'neck',
  ]

  measurementFields.forEach((field) => {
    const value = measurementData.value[field]
    if (value !== 0) {
      if (!measurement.measurements) {
        measurement.measurements = {}
      }
      measurement.measurements[field] = value
    }
  })

  store.addMeasurement(measurement)
  resetForm()
}

const handleEdit = (measurement: MeasurementData) => {
  const newData: MeasurementFormData = {
    chest: measurement.measurements?.chest || 0,
    waist: measurement.measurements?.waist || 0,
    hips: measurement.measurements?.hips || 0,
    arms: measurement.measurements?.arms || 0,
    forearms: measurement.measurements?.forearms || 0,
    thighs: measurement.measurements?.thighs || 0,
    calves: measurement.measurements?.calves || 0,
    neck: measurement.measurements?.neck || 0,
    date: measurement.date.split('T')[0],
    notes: measurement.notes || '',
  }
  measurementData.value = newData
}

onMounted(() => {
  if (store.editingMeasurement) {
    handleEdit(store.editingMeasurement)
  }
})
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
