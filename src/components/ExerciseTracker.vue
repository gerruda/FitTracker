<template>
  <div class="exercise-tracker">
    <div class="container">
      <div class="card">
        <h2>Упражнения</h2>

        <form @submit.prevent="handleSubmit" class="exercise-form">
          <div class="form-header">
            <h3>{{ isEditing ? 'Редактирование упражнения' : 'Новое упражнение' }}</h3>
            <button
              v-if="isEditing"
              type="button"
              class="btn btn-secondary"
              @click="resetForm"
            >
              Отменить
            </button>
          </div>

          <div class="form-group">
            <label for="date">Дата</label>
            <input
              type="date"
              id="date"
              v-model="exerciseData.date"
              class="form-control"
              required
            />
          </div>

          <div class="form-group">
            <label for="name">Название упражнения</label>
            <div class="exercise-name-input">
              <select
                v-if="uniqueExercises.length && !isEditing"
                v-model="exerciseData.name"
                class="form-control"
                @change="handleExerciseSelect"
              >
                <option value="">Новое упражнение</option>
                <option v-for="exercise in uniqueExercises" :key="exercise" :value="exercise">
                  {{ exercise }}
                </option>
              </select>
              <input
                v-if="isEditing || !exerciseData.name || !uniqueExercises.includes(exerciseData.name)"
                type="text"
                id="newExercise"
                v-model="exerciseData.name"
                class="form-control"
                :readonly="isEditing"
                placeholder="Введите название упражнения"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="weight">Вес (кг)</label>
            <input
              type="number"
              id="weight"
              v-model="exerciseData.weight"
              class="form-control"
              step="0.5"
              min="0"
              required
            />
          </div>

          <div class="form-group">
            <label for="reps">Повторения</label>
            <input
              type="number"
              id="reps"
              v-model="exerciseData.reps"
              class="form-control"
              min="1"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary">
            {{ isEditing ? 'Сохранить изменения' : 'Сохранить' }}
          </button>
        </form>

        <div v-if="selectedExercise" class="exercise-charts">
          <ExerciseChart
            :exercises="store.exercises.filter((e: ExerciseData) => e.name === selectedExercise)"
          />
        </div>

        <div class="exercise-history">
          <h3>История упражнений</h3>

          <div class="filter-section">
            <label for="exerciseFilter">Фильтр по упражнению:</label>
            <select v-model="selectedExercise" id="exerciseFilter" class="form-control">
              <option value="">Все упражнения</option>
              <option v-for="exercise in uniqueExercises" :key="exercise" :value="exercise">
                {{ exercise }}
              </option>
            </select>
          </div>

          <div class="exercise-list" v-if="filteredExercises.length">
            <div class="exercise-item" v-for="exercise in filteredExercises" :key="exercise.id">
              <div class="exercise-header">
                <div class="exercise-info">
                  <h4>{{ exercise.name }}</h4>
                  <span class="date">{{ formatDate(exercise.date) }}</span>
                </div>
                <div class="exercise-actions">
                  <button class="btn btn-icon" @click="editExercise(exercise)" title="Редактировать">
                    <span>✏️</span>
                  </button>
                  <button class="btn btn-icon" @click="deleteExercise(exercise.id)" title="Удалить">
                    <span>🗑️</span>
                  </button>
                </div>
              </div>
              <div class="exercise-details">
                <div class="detail-item">
                  <span class="label">Вес:</span>
                  <span class="value">{{ exercise.weight }} кг</span>
                </div>
                <div class="detail-item">
                  <span class="label">Повторения:</span>
                  <span class="value">{{ exercise.reps }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">1RM:</span>
                  <span class="value">{{ exercise.calculatedOneRepMax }} кг</span>
                </div>
              </div>
            </div>
          </div>
          <div class="empty-state" v-else>
            <p>Нет записей</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFitnessStore } from '@/stores/fitness'
import type { ExerciseData } from '@/types'
import { formatDate } from '@/utils/formatters'
import ExerciseChart from './ExerciseChart.vue'

const store = useFitnessStore()

interface ExerciseForm {
  id: string
  name: string
  date: string
  weight: number
  reps: number
}

const exerciseData = ref<ExerciseForm>({
  id: crypto.randomUUID(),
  name: '',
  date: new Date().toISOString().split('T')[0],
  weight: 0,
  reps: 0,
})

const isEditing = ref(false)

const selectedExercise = ref('')

const calculateOneRepMax = (weight: number, reps: number): number => {
  return store.calculateOneRepMax(weight, reps)
}

const resetForm = () => {
  exerciseData.value = {
    id: crypto.randomUUID(),
    name: '',
    date: new Date().toISOString().split('T')[0],
    weight: 0,
    reps: 0,
  }
  isEditing.value = false
}

const handleSubmit = () => {
  const exercise: ExerciseData = {
    id: exerciseData.value.id,
    name: exerciseData.value.name,
    date: exerciseData.value.date,
    weight: exerciseData.value.weight,
    reps: exerciseData.value.reps,
    calculatedOneRepMax: calculateOneRepMax(exerciseData.value.weight, exerciseData.value.reps),
  }

  if (isEditing.value) {
    store.updateExercise(exercise)
  } else {
    store.addExercise(exercise)
  }

  selectedExercise.value = exercise.name
  resetForm()
}

const editExercise = (exercise: ExerciseData) => {
  exerciseData.value = {
    id: exercise.id,
    name: exercise.name,
    date: exercise.date,
    weight: exercise.weight,
    reps: exercise.reps,
  }
  isEditing.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const deleteExercise = (id: string) => {
  if (confirm('Вы уверены, что хотите удалить это упражнение?')) {
    store.deleteExercise(id)
  }
}

const uniqueExercises = computed(() => {
  const exercises = new Set(store.exercises.map((e) => e.name))
  return Array.from(exercises).sort()
})

const filteredExercises = computed(() => {
  return store.exercises
    .filter((e) => !selectedExercise.value || e.name === selectedExercise.value)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const handleExerciseSelect = () => {
  if (exerciseData.value.name === '') {
    exerciseData.value.name = ''
  }
}
</script>

<style scoped>
.exercise-tracker {
  padding: 1rem;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--box-shadow);
}

.card h2 {
  margin-top: 0;
  margin-bottom: 2rem;
  color: var(--primary-color);
}

.exercise-form {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
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

.exercise-name-input {
  display: flex;
  gap: 1rem;
}

.form-control {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-color-dark);
}

.exercise-history {
  margin-top: 2rem;
}

.exercise-history h3 {
  margin-bottom: 1rem;
  color: var(--secondary-color);
}

.filter-section {
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.exercise-list {
  display: grid;
  gap: 1rem;
}

.exercise-item {
  background: var(--bg-light);
  border-radius: var(--border-radius);
  padding: 1rem;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.exercise-info h4 {
  margin: 0;
  color: var(--primary-color);
}

.date {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.exercise-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-icon:hover {
  opacity: 1;
}

.exercise-details {
  display: grid;
  gap: 0.5rem;
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

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem;
}

.exercise-charts {
  margin: 2rem 0;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.form-header h3 {
  margin: 0;
  color: var(--secondary-color);
}

.btn-secondary {
  background: var(--bg-light);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--border-color);
}

@media (max-width: 768px) {
  .card {
    padding: 1rem;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
