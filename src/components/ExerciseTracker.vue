<template>
  <div class="exercise-tracker">
    <div class="container">
      <div class="card">
        <h2>Отслеживание упражнений</h2>

        <form @submit.prevent="addExercise" class="exercise-form">
          <div class="form-group">
            <label for="exerciseName">Название упражнения</label>
            <input 
              type="text" 
              id="exerciseName" 
              v-model="exerciseData.name" 
              class="form-control"
              required
              list="exerciseList"
            >
            <datalist id="exerciseList">
              <option v-for="name in uniqueExerciseNames" :key="name" :value="name" />
            </datalist>
          </div>

          <div class="form-group">
            <label for="date">Дата</label>
            <input 
              type="date" 
              id="date" 
              v-model="exerciseData.date" 
              class="form-control"
              required
            >
          </div>

          <div class="form-group">
            <label for="exerciseWeight">Вес (кг)</label>
            <input 
              type="number" 
              id="exerciseWeight" 
              v-model="exerciseData.weight" 
              class="form-control"
              required
              step="0.5"
            >
          </div>

          <div class="form-group">
            <label for="exerciseReps">Повторения</label>
            <input 
              type="number" 
              id="exerciseReps" 
              v-model="exerciseData.reps" 
              class="form-control"
              required
              min="1"
            >
          </div>

          <button type="submit" class="btn btn-primary">Добавить упражнение</button>
        </form>
      </div>

      <div class="card" v-if="selectedExercise">
        <h3>Прогресс: {{ selectedExercise }}</h3>
        <div class="chart-container">
          <Line
            v-if="exerciseChartData.datasets[0].data.length > 0"
            :data="exerciseChartData"
            :options="chartOptions"
          />
          <p v-else class="no-data">Нет данных для этого упражнения</p>
        </div>
      </div>

      <div class="card">
        <h3>История упражнений</h3>
        <div class="exercise-filters">
          <div class="form-group">
            <label for="filterExercise">Фильтр по упражнению</label>
            <select 
              id="filterExercise" 
              v-model="selectedExercise" 
              class="form-control"
            >
              <option value="">Все упражнения</option>
              <option v-for="name in uniqueExerciseNames" :key="name" :value="name">
                {{ name }}
              </option>
            </select>
          </div>
        </div>

        <div class="exercise-list">
          <div 
            v-for="exercise in filteredExercises" 
            :key="exercise.id" 
            class="exercise-item"
          >
            <div class="exercise-details">
              <h4>{{ exercise.name }}</h4>
              <p class="exercise-date">{{ formatDate(exercise.date) }}</p>
              <p class="exercise-stats">
                {{ exercise.weight }}кг × {{ exercise.reps }} повт.
                <span class="one-rep-max">
                  (1ПМ: {{ exercise.calculatedOneRepMax }}кг)
                </span>
              </p>
            </div>
            <button 
              class="btn btn-secondary delete-btn"
              @click="deleteExercise(exercise.id)"
              title="Удалить запись"
            >
              <span class="mdi mdi-delete"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useFitnessStore } from '@/stores/fitness';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const store = useFitnessStore();
const selectedExercise = ref('');

const exerciseData = reactive({
  date: new Date().toISOString().split('T')[0],
  name: '',
  weight: undefined as number | undefined,
  reps: undefined as number | undefined,
  notes: ''
});

const uniqueExerciseNames = computed(() => {
  return [...new Set(store.exercises.map(e => e.name))].sort();
});

const filteredExercises = computed(() => {
  let exercises = [...store.exercises];
  
  if (selectedExercise.value) {
    exercises = exercises.filter(e => e.name === selectedExercise.value);
  }
  
  return exercises.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const exerciseChartData = computed(() => {
  if (!selectedExercise.value) return { labels: [], datasets: [{ data: [] }] };

  const exercises = store.exercises
    .filter(e => e.name === selectedExercise.value)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    labels: exercises.map(e => formatDate(e.date)),
    datasets: [
      {
        label: 'Вес (кг)',
        data: exercises.map(e => e.weight),
        borderColor: '#4CAF50',
        tension: 0.1
      },
      {
        label: '1ПМ (кг)',
        data: exercises.map(e => e.calculatedOneRepMax),
        borderColor: '#2196F3',
        tension: 0.1
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const
    }
  },
  scales: {
    y: {
      beginAtZero: false
    }
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

const addExercise = () => {
  if (exerciseData.weight && exerciseData.reps) {
    const oneRepMax = store.calculateOneRepMax(exerciseData.weight, exerciseData.reps);
    
    store.addExercise({
      ...exerciseData,
      calculatedOneRepMax: oneRepMax
    } as ExerciseData);

    // Сброс формы
    exerciseData.weight = undefined;
    exerciseData.reps = undefined;
    exerciseData.date = new Date().toISOString().split('T')[0];
    
    // Выбор упражнения в фильтре, если оно еще не выбрано
    if (!selectedExercise.value) {
      selectedExercise.value = exerciseData.name;
    }
  }
};

const deleteExercise = (id: string) => {
  if (confirm('Вы уверены, что хотите удалить эту запись?')) {
    const exercises = store.exercises.filter(e => e.id !== id);
    localStorage.setItem('exercises', JSON.stringify(exercises));
    // Перезагрузка страницы для обновления данных
    window.location.reload();
  }
};
</script>

<style scoped>
.exercise-tracker {
  padding: 1rem;
}

.exercise-form {
  margin-bottom: 2rem;
}

.exercise-filters {
  margin-bottom: 1rem;
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.exercise-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.exercise-details h4 {
  margin: 0;
  color: var(--secondary-color);
}

.exercise-date {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.exercise-stats {
  margin: 0;
  font-weight: 500;
}

.one-rep-max {
  color: var(--primary-color);
  margin-left: 0.5rem;
}

.delete-btn {
  padding: 0.5rem;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ff5252;
}

.delete-btn:hover {
  background-color: #ff1744;
}

@media (max-width: 768px) {
  .exercise-tracker {
    padding: 0.5rem;
  }

  .exercise-item {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .delete-btn {
    align-self: flex-end;
  }
}
</style> 