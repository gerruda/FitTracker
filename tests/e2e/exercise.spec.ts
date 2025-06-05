import { test, expect } from '@playwright/test';

test.describe('Exercise Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should add a new exercise', async ({ page }) => {
    // Заполняем форму нового упражнения
    await page.fill('#date', '2024-03-20');
    await page.fill('#newExercise', 'Приседания');
    await page.fill('#weight', '100');
    await page.fill('#reps', '5');

    // Отправляем форму
    await page.click('button[type="submit"]');

    // Проверяем, что упражнение добавлено
    await expect(page.locator('.exercise-item')).toContainText('Приседания');
    await expect(page.locator('.exercise-item')).toContainText('100 кг');
    await expect(page.locator('.exercise-item')).toContainText('5 повторений');
  });

  test('should edit existing exercise', async ({ page }) => {
    // Сначала добавляем упражнение
    await page.fill('#date', '2024-03-20');
    await page.fill('#newExercise', 'Жим лежа');
    await page.fill('#weight', '80');
    await page.fill('#reps', '8');
    await page.click('button[type="submit"]');

    // Нажимаем кнопку редактирования
    await page.click('[title="Редактировать"]');

    // Изменяем вес
    await page.fill('#weight', '85');

    // Сохраняем изменения
    await page.click('button[type="submit"]');

    // Проверяем, что изменения сохранились
    await expect(page.locator('.exercise-item')).toContainText('85 кг');
  });

  test('should delete exercise', async ({ page }) => {
    // Добавляем упражнение
    await page.fill('#date', '2024-03-20');
    await page.fill('#newExercise', 'Становая тяга');
    await page.fill('#weight', '120');
    await page.fill('#reps', '3');
    await page.click('button[type="submit"]');

    // Проверяем, что упражнение добавлено
    await expect(page.locator('.exercise-item')).toContainText('Становая тяга');

    // Подтверждаем диалог удаления
    page.on('dialog', dialog => dialog.accept());

    // Удаляем упражнение
    await page.click('[title="Удалить"]');

    // Проверяем, что упражнение удалено
    await expect(page.locator('.exercise-item')).not.toBeVisible();
  });

  test('should show exercise progress chart', async ({ page }) => {
    // Добавляем несколько записей одного упражнения
    const exercises = [
      { date: '2024-03-01', weight: 100 },
      { date: '2024-03-10', weight: 105 },
      { date: '2024-03-20', weight: 110 }
    ];

    for (const exercise of exercises) {
      await page.fill('#date', exercise.date);
      await page.fill('#newExercise', 'Приседания');
      await page.fill('#weight', exercise.weight.toString());
      await page.fill('#reps', '5');
      await page.click('button[type="submit"]');
    }

    // Переходим на страницу аналитики
    await page.click('text=Аналитика');

    // Проверяем наличие графика
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    // Пытаемся отправить пустую форму
    await page.click('button[type="submit"]');

    // Проверяем сообщения об ошибках
    await expect(page.locator('text=Это поле обязательно')).toBeVisible();

    // Проверяем валидацию отрицательного веса
    await page.fill('#weight', '-10');
    await expect(page.locator('text=Вес должен быть положительным числом')).toBeVisible();

    // Проверяем валидацию отрицательного количества повторений
    await page.fill('#reps', '-5');
    await expect(page.locator('text=Количество повторений должно быть положительным числом')).toBeVisible();
  });
});
