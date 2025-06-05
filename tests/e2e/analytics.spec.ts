import { test, expect } from '@playwright/test';

test.describe('Analytics View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Добавляем тестовые данные
    const exercises = [
      { date: '2024-02-01', name: 'Приседания', weight: 100, reps: 5 },
      { date: '2024-02-15', name: 'Приседания', weight: 105, reps: 5 },
      { date: '2024-03-01', name: 'Приседания', weight: 110, reps: 5 },
      { date: '2024-03-15', name: 'Жим лежа', weight: 80, reps: 8 },
      { date: '2024-03-20', name: 'Жим лежа', weight: 85, reps: 8 }
    ];

    for (const exercise of exercises) {
      await page.fill('#date', exercise.date);
      await page.fill('#newExercise', exercise.name);
      await page.fill('#weight', exercise.weight.toString());
      await page.fill('#reps', exercise.reps.toString());
      await page.click('button[type="submit"]');
    }

    // Переходим на страницу аналитики
    await page.click('text=Аналитика');
  });

  test('should display exercise progress charts', async ({ page }) => {
    // Проверяем наличие графиков
    await expect(page.locator('canvas')).toHaveCount(2); // Два упражнения = два графика
  });

  test('should show monthly progress comparison', async ({ page }) => {
    // Проверяем наличие сравнения с прошлым месяцем
    await expect(page.getByText('Прогресс за март')).toBeVisible();
    await expect(page.getByText('Сравнение с февралем')).toBeVisible();
  });

  test('should display exercise statistics', async ({ page }) => {
    // Проверяем статистику для приседаний
    await expect(page.getByText('Приседания')).toBeVisible();
    await expect(page.getByText('Максимальный вес: 110 кг')).toBeVisible();
    await expect(page.getByText('Прогресс за последний месяц: +5 кг')).toBeVisible();
  });

  test('should filter exercises by date range', async ({ page }) => {
    // Выбираем диапазон дат
    await page.fill('input[type="date"][name="startDate"]', '2024-03-01');
    await page.fill('input[type="date"][name="endDate"]', '2024-03-31');
    await page.click('text=Применить');

    // Проверяем, что отображаются только упражнения за март
    await expect(page.getByText('01.03.2024')).toBeVisible();
    await expect(page.getByText('01.02.2024')).not.toBeVisible();
  });

  test('should calculate and display one rep max', async ({ page }) => {
    // Проверяем расчет 1ПМ для приседаний
    // Формула Брзыцки: weight * (36 / (37 - reps))
    const weight = 110;
    const reps = 5;
    const oneRepMax = Math.round(weight * (36 / (37 - reps)));

    await expect(page.getByText(`Расчетный 1ПМ: ${oneRepMax} кг`)).toBeVisible();
  });

  test('should show exercise type selection', async ({ page }) => {
    // Проверяем наличие выпадающего списка с упражнениями
    const select = page.locator('select');
    await expect(select).toBeVisible();

    // Проверяем наличие обоих упражнений в списке
    const options = await select.locator('option').allInnerTexts();
    expect(options).toContain('Приседания');
    expect(options).toContain('Жим лежа');
  });
});
