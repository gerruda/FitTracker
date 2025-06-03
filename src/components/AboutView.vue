<template>
  <div class="about-view">
    <div class="welcome-section">
      <img src="/images/logo.svg" alt="FitTracker" class="welcome-logo">
      <h1>Добро пожаловать в FitTracker</h1>
      <p class="welcome-text">
        Ваш персональный помощник для отслеживания прогресса в фитнесе
      </p>
    </div>

    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">⚖️</div>
        <h3>Отслеживание веса</h3>
        <p>Записывайте свой вес и следите за его изменением во времени. Визуализируйте свой прогресс с помощью графиков.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">📏</div>
        <h3>Измерения тела</h3>
        <p>Ведите учет измерений различных частей тела: грудь, талия, бедра, руки и ноги.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">🧬</div>
        <h3>Состав тела</h3>
        <p>Отслеживайте изменения в составе тела: мышечная масса, жировая масса, вода, висцеральный жир и общая оценка.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3>Аналитика</h3>
        <p>Анализируйте свой прогресс с помощью наглядных графиков и статистики.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">💪</div>
        <h3>Упражнения</h3>
        <p>Записывайте свои тренировки и следите за прогрессом в силовых показателях.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon">🧮</div>
        <h3>Расчеты</h3>
        <p>Рассчитывайте важные показатели: TDEE, норму воды, максимальный вес в одном повторении.</p>
      </div>
    </div>

    <div class="getting-started">
      <h2>Как начать использовать</h2>
      <ol class="steps-list">
        <li>
          <h4>Заполните профиль</h4>
          <p>Укажите ваш пол, возраст и уровень активности для точных расчетов.</p>
        </li>
        <li>
          <h4>Начните с базовых измерений</h4>
          <p>Запишите свой текущий вес и основные измерения тела.</p>
        </li>
        <li>
          <h4>Отслеживайте прогресс</h4>
          <p>Регулярно обновляйте измерения и следите за изменениями в разделе аналитики.</p>
        </li>
      </ol>
    </div>

    <div class="start-button">
      <button class="btn btn-primary" @click="startUsing">Начать использование</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFitnessStore } from '@/stores/fitness';
import { useRouter } from 'vue-router';

const store = useFitnessStore();
const router = useRouter();

const startUsing = () => {
  store.setHasSeenIntro(true);
  router.push('/measurements/weight');
};
</script>

<style scoped>
.about-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-logo {
  width: 120px;
  height: auto;
  margin-bottom: 1rem;
}

.welcome-text {
  font-size: 1.25rem;
  color: var(--text-muted);
  margin: 1rem 0 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.getting-started {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  margin-bottom: 2rem;
}

.steps-list {
  padding-left: 1.5rem;
}

.steps-list li {
  margin-bottom: 1.5rem;
}

.steps-list h4 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.start-button {
  text-align: center;
}

@media (max-width: 768px) {
  .about-view {
    padding: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .welcome-text {
    font-size: 1.1rem;
  }
}
</style> 