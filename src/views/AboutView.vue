<template>
  <div class="about">
    <h2>О приложении FitTracker</h2>
    
    <div class="content">
      <section>
        <h3>🎯 Назначение</h3>
        <p>FitTracker - это персональный помощник для отслеживания вашего прогресса в фитнесе. Приложение помогает вести учет основных показателей тела, тренировок и следить за динамикой изменений.</p>
      </section>

      <section>
        <h3>📊 Возможности</h3>
        <ul>
          <li>Отслеживание веса тела</li>
          <li>Измерение обхватов тела</li>
          <li>Анализ состава тела (жир, мышцы, вода)</li>
          <li>Ведение дневника упражнений</li>
          <li>Расчет важных показателей (TDEE, BMI)</li>
          <li>Визуализация прогресса</li>
        </ul>
      </section>

      <section>
        <h3>💡 Рекомендации</h3>
        <ul>
          <li>Ведите регулярные записи для лучшего отслеживания прогресса</li>
          <li>Измеряйте показатели в одно и то же время дня</li>
          <li>Используйте одни и те же инструменты для измерений</li>
          <li>Записывайте дополнительные заметки при необходимости</li>
        </ul>
      </section>

      <section>
        <h3>🔒 Конфиденциальность</h3>
        <p>Все ваши данные хранятся локально в браузере и не передаются на сервер. Вы можете экспортировать и импортировать данные для резервного копирования.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.content {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

section {
  margin-bottom: 2rem;
}

section:last-child {
  margin-bottom: 0;
}

h2 {
  color: var(--primary-color);
  margin-bottom: 2rem;
  text-align: center;
}

h3 {
  color: var(--secondary-color);
  margin-bottom: 1rem;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

li::before {
  content: "•";
  color: var(--primary-color);
  position: absolute;
  left: 0;
}

p {
  line-height: 1.6;
  color: var(--text-color);
}

@media (max-width: 768px) {
  .content {
    padding: 1.5rem;
  }
}
</style>
