<template>
  <div class="calculations">
    <div class="container">
      <div class="calculations-grid">
        <div class="card">
          <h2>Калькулятор TDEE</h2>
          <form @submit.prevent="calculateTDEE" class="calculation-form">
            <div class="form-group">
              <label for="weight">Вес (кг)</label>
              <input 
                type="number" 
                id="weight" 
                v-model="tdeeData.weight" 
                class="form-control"
                required
                step="0.1"
              >
            </div>

            <div class="form-group">
              <label for="height">Рост (см)</label>
              <input 
                type="number" 
                id="height" 
                v-model="tdeeData.height" 
                class="form-control"
                required
              >
            </div>

            <div class="form-group">
              <label for="age">Возраст</label>
              <input 
                type="number" 
                id="age" 
                v-model="tdeeData.age" 
                class="form-control"
                required
              >
            </div>

            <div class="form-group">
              <label for="gender">Пол</label>
              <select id="gender" v-model="tdeeData.gender" class="form-control" required>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>

            <div class="form-group">
              <label for="activityLevel">Уровень активности</label>
              <select id="activityLevel" v-model="tdeeData.activityLevel" class="form-control" required>
                <option value="1.2">Сидячий (мало или совсем нет упражнений)</option>
                <option value="1.375">Легкая активность (легкие упражнения 1-3 дня/неделю)</option>
                <option value="1.55">Умеренная активность (умеренные упражнения 3-5 дней/неделю)</option>
                <option value="1.725">Высокая активность (интенсивные упражнения 6-7 дней/неделю)</option>
                <option value="1.9">Очень высокая активность (очень интенсивные упражнения и физическая работа)</option>
              </select>
            </div>

            <button type="submit" class="btn btn-primary">Рассчитать TDEE</button>
          </form>

          <div v-if="tdeeResult" class="result">
            <h3>Ваш суточный расход энергии:</h3>
            <p class="result-value">{{ tdeeResult }} ккал/день</p>
          </div>
        </div>

        <div class="card">
          <h2>Калькулятор потребления воды</h2>
          <form @submit.prevent="calculateWater" class="calculation-form">
            <div class="form-group">
              <label for="waterWeight">Вес (кг)</label>
              <input 
                type="number" 
                id="waterWeight" 
                v-model="waterWeight" 
                class="form-control"
                required
                step="0.1"
              >
            </div>

            <button type="submit" class="btn btn-primary">Рассчитать потребление воды</button>
          </form>

          <div v-if="waterResult" class="result">
            <h3>Рекомендуемое потребление воды:</h3>
            <p class="result-value">{{ waterResult }} л/день</p>
          </div>
        </div>

        <div class="card">
          <h2>Калькулятор 1 повторения максимум</h2>
          <form @submit.prevent="calculateOneRepMax" class="calculation-form">
            <div class="form-group">
              <label for="weight">Вес (кг)</label>
              <input 
                type="number" 
                id="weight" 
                v-model="oneRepMaxData.weight" 
                class="form-control"
                required
                step="0.5"
              >
            </div>

            <div class="form-group">
              <label for="reps">Повторения</label>
              <input 
                type="number" 
                id="reps" 
                v-model="oneRepMaxData.reps" 
                class="form-control"
                required
                min="1"
              >
            </div>

            <button type="submit" class="btn btn-primary">Рассчитать 1ПМ</button>
          </form>

          <div v-if="oneRepMaxResult" class="result">
            <h3>Расчетный максимум на одно повторение:</h3>
            <p class="result-value">{{ oneRepMaxResult }} кг</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useFitnessStore } from '@/stores/fitness';

const store = useFitnessStore();

const tdeeData = reactive({
  weight: undefined as number | undefined,
  height: undefined as number | undefined,
  age: undefined as number | undefined,
  gender: 'male' as 'male' | 'female',
  activityLevel: '1.55'
});

const waterWeight = ref<number>();
const oneRepMaxData = reactive({
  weight: undefined as number | undefined,
  reps: undefined as number | undefined
});

const tdeeResult = ref<number>();
const waterResult = ref<number>();
const oneRepMaxResult = ref<number>();

const calculateTDEE = () => {
  if (tdeeData.weight && tdeeData.height && tdeeData.age) {
    tdeeResult.value = store.calculateTDEE(
      tdeeData.weight,
      tdeeData.height,
      tdeeData.age,
      tdeeData.gender,
      parseFloat(tdeeData.activityLevel)
    );
  }
};

const calculateWater = () => {
  if (waterWeight.value) {
    waterResult.value = store.calculateWaterIntake(waterWeight.value);
  }
};

const calculateOneRepMax = () => {
  if (oneRepMaxData.weight && oneRepMaxData.reps) {
    oneRepMaxResult.value = store.calculateOneRepMax(oneRepMaxData.weight, oneRepMaxData.reps);
  }
};
</script>

<style scoped>
.calculations {
  padding: 2rem 1rem;
}

.calculations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.calculation-form {
  margin-top: 1rem;
}

.result {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.result h3 {
  color: var(--secondary-color);
  margin-bottom: 0.5rem;
}

.result-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin: 0;
}

@media (max-width: 768px) {
  .calculations {
    padding: 1rem 0.5rem;
  }

  .calculations-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style> 