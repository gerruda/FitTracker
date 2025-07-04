<template>
  <div class="body-composition">
    <div class="card profile-card" v-if="!userStore.profile.age">
      <h3>Заполните профиль</h3>
      <p>Для точных расчетов необходимо указать ваши данные</p>
      <form @submit.prevent="saveProfile" class="profile-form">
        <div class="form-group">
          <label for="gender">Пол</label>
          <select id="gender" v-model="profileData.gender" class="form-control" required>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
        </div>

        <div class="form-group">
          <label for="age">Возраст</label>
          <input
            type="number"
            id="age"
            v-model="profileData.age"
            class="form-control"
            required
            min="14"
            max="100"
          />
        </div>

        <div class="form-group">
          <label for="activityLevel">Уровень активности</label>
          <select
            id="activityLevel"
            v-model="profileData.activityLevel"
            class="form-control"
            required
          >
            <option v-for="level in activityLevels" :key="level.value" :value="level">
              {{ level.label }}
            </option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary">Сохранить профиль</button>
      </form>
    </div>

    <div class="card">
      <h2>Состав тела</h2>

      <form @submit.prevent="saveComposition" class="measurement-form">
        <div class="form-group">
          <label for="date">Дата</label>
          <input
            type="date"
            id="date"
            v-model="compositionData.date"
            class="form-control"
            required
          />
        </div>

        <div class="measurements-section">
          <h3>Основные показатели</h3>
          <div class="form-group">
            <label for="totalWeight">Общий вес (кг)</label>
            <input
              type="number"
              id="totalWeight"
              v-model="compositionData.weight"
              class="form-control"
              step="0.1"
              required
              min="30"
              max="250"
            />
          </div>

          <div class="form-group">
            <label for="waterMass">Общее количество воды (л)</label>
            <input
              type="number"
              id="waterMass"
              v-model="compositionData.waterMass"
              class="form-control"
              step="0.1"
              min="20"
              max="100"
            />
          </div>

          <div class="form-group">
            <label for="bodyFatMass">Содержание жира (кг)</label>
            <input
              type="number"
              id="bodyFatMass"
              v-model="compositionData.bodyFatMass"
              class="form-control"
              step="0.1"
              min="2"
              max="100"
            />
          </div>

          <div class="form-group">
            <label for="muscleMass">Масса скелетной мускулатуры (кг)</label>
            <input
              type="number"
              id="muscleMass"
              v-model="compositionData.muscleMass"
              class="form-control"
              step="0.1"
              min="20"
              max="100"
            />
          </div>

          <div class="form-group">
            <label for="visceralFat">Уровень висцерального жира</label>
            <input
              type="number"
              id="visceralFat"
              v-model="compositionData.visceralFat"
              class="form-control"
              step="1"
              min="1"
              max="50"
            />
          </div>

          <div class="form-group">
            <label for="bmi">ИМТ</label>
            <input
              type="number"
              id="bmi"
              v-model="compositionData.bmi"
              class="form-control"
              step="0.1"
              min="10"
              max="50"
            />
          </div>

          <div class="form-group">
            <label for="totalScore">Общая оценка (0-100)</label>
            <input
              type="number"
              id="totalScore"
              v-model="compositionData.totalScore"
              class="form-control"
              step="1"
              min="0"
              max="100"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="notes">Примечания</label>
          <textarea
            id="notes"
            v-model="compositionData.notes"
            class="form-control"
            placeholder="Например: после тренировки, натощак, etc."
          ></textarea>
        </div>

        <div v-if="calculatedTDEE" class="tdee-info">
          <h3>Расчетный TDEE</h3>
          <p class="tdee-value">{{ calculatedTDEE }} ккал/день</p>
          <p class="tdee-explanation">Основано на формуле с учетом вашего состава тела</p>
        </div>

        <div class="button-group">
          <button type="submit" class="btn btn-primary">Сохранить измерения</button>
          <button type="button" class="btn btn-secondary" @click="exportData">
            Экспортировать данные
          </button>
          <button type="button" class="btn btn-secondary" @click="importData">
            Импортировать данные
          </button>
        </div>
      </form>

      <MeasurementHistoryTable type="composition" @edit="handleEdit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref } from 'vue'
import { useFitnessStore } from '@/stores/fitness'
import { useUserStore, activityLevels, type UserProfile } from '@/stores/user'
import MeasurementHistoryTable from './MeasurementHistoryTable.vue'
import type { MeasurementData } from '@/types'

const store = useFitnessStore()
const userStore = useUserStore()

const profileData = reactive<UserProfile>({
  gender: userStore.profile.gender,
  age: userStore.profile.age,
  activityLevel: userStore.profile.activityLevel,
})

interface CompositionData {
  bodyFatPercentage: number
  bodyFatMass: number
  musclePercentage: number
  muscleMass: number
  bonePercentage: number
  boneMass: number
  waterPercentage: number
  waterMass: number
  visceralFat: number
  bmi: number
  totalScore: number
  date: string
  weight: number | undefined
  notes: string
}

const compositionData = ref<CompositionData>({
  bodyFatPercentage: 0,
  bodyFatMass: 0,
  musclePercentage: 0,
  muscleMass: 0,
  bonePercentage: 0,
  boneMass: 0,
  waterPercentage: 0,
  waterMass: 0,
  visceralFat: 0,
  bmi: 0,
  totalScore: 0,
  date: new Date().toISOString().split('T')[0],
  weight: undefined,
  notes: '',
})

const calculatedTDEE = computed(() => {
  if (
    !compositionData.value.weight ||
    !compositionData.value.bodyFatMass ||
    !userStore.profile?.age
  ) {
    return null
  }

  const leanMass = compositionData.value.weight - compositionData.value.bodyFatMass
  const bmr = 21.6 * leanMass + 370
  const activityLevel = userStore.profile.activityLevel?.value || 1.2
  return Math.round(bmr * activityLevel)
})

const measurements = computed(() => store.measurements)

const saveProfile = () => {
  userStore.updateProfile(profileData)
}

const saveComposition = () => {
  if (compositionData.value.weight) {
    // Рассчитываем процентные значения
    const waterPercentage = compositionData.value.waterMass
      ? ((compositionData.value.waterMass / compositionData.value.weight) * 100).toFixed(1)
      : undefined
    const bodyFatPercentage = compositionData.value.bodyFatMass
      ? ((compositionData.value.bodyFatMass / compositionData.value.weight) * 100).toFixed(1)
      : undefined
    const musclePercentage = compositionData.value.muscleMass
      ? ((compositionData.value.muscleMass / compositionData.value.weight) * 100).toFixed(1)
      : undefined

    const measurement: MeasurementData = {
      date: new Date().toISOString(),
      bodyFatMass: compositionData.value.bodyFatMass,
      bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : undefined,
      muscleMass: compositionData.value.muscleMass,
      musclePercentage: musclePercentage ? parseFloat(musclePercentage) : undefined,
      waterMass: compositionData.value.waterMass,
      waterPercentage: waterPercentage ? parseFloat(waterPercentage) : undefined,
      bmi: compositionData.value.bmi,
      totalScore: compositionData.value.totalScore,
      visceralFat: compositionData.value.visceralFat,
      tdee: calculatedTDEE.value || undefined,
    }

    store.addMeasurement(measurement)
    resetForm()
  }
}

const resetForm = () => {
  const defaultData: CompositionData = {
    bodyFatPercentage: 0,
    bodyFatMass: 0,
    musclePercentage: 0,
    muscleMass: 0,
    bonePercentage: 0,
    boneMass: 0,
    waterPercentage: 0,
    waterMass: 0,
    visceralFat: 0,
    bmi: 0,
    totalScore: 0,
    date: new Date().toISOString().split('T')[0],
    weight: undefined,
    notes: '',
  }
  compositionData.value = defaultData
}

const handleEdit = (measurement: MeasurementData) => {
  const newData: CompositionData = {
    bodyFatPercentage: measurement.bodyFatPercentage || 0,
    bodyFatMass: measurement.bodyFatMass || 0,
    musclePercentage: measurement.musclePercentage || 0,
    muscleMass: measurement.muscleMass || 0,
    bonePercentage: measurement.bonePercentage || 0,
    boneMass: measurement.boneMass || 0,
    waterPercentage: measurement.waterPercentage || 0,
    waterMass: measurement.waterMass || 0,
    visceralFat: measurement.visceralFat || 0,
    bmi: measurement.bmi || 0,
    totalScore: measurement.totalScore || 0,
    date: measurement.date.split('T')[0],
    weight: measurement.weight,
    notes: measurement.notes || '',
  }
  compositionData.value = newData
}

const exportData = () => {
  const data = JSON.stringify(measurements.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'body-composition-data.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const importData = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = handleFileChange
  input.click()
}

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  const reader = new FileReader()

  reader.onload = (e) => {
    const result = e.target?.result
    if (typeof result === 'string' && store.importData(result)) {
      alert('Данные успешно импортированы')
    } else {
      alert('Ошибка при импорте данных')
    }
  }

  reader.readAsText(file)
}

onMounted(() => {
  if (store.editingMeasurement) {
    handleEdit(store.editingMeasurement)
  }
})
</script>

<style scoped>
.body-composition {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.card {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.measurements-section {
  background: #f8f9fa;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.measurements-history {
  margin-top: 2rem;
}

.measurements-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.tdee-info {
  background: #e8f5e9;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin: 1.5rem 0;
}

.tdee-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  margin: 0.5rem 0;
}

textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

@media (max-width: 768px) {
  .measurements-table {
    font-size: 0.875rem;
  }

  .button-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>
