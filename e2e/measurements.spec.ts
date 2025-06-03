import { test, expect } from '@playwright/test';

test.describe('Measurements Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete measurement flow', async ({ page }) => {
    // Добавление веса
    await test.step('Add weight measurement', async () => {
      await page.click('text=Вес');
      await page.fill('input[type="number"]', '75.5');
      await page.fill('textarea', 'Weight test note');
      await page.click('button:has-text("Сохранить")');
      
      // Проверяем, что измерение появилось в истории
      await expect(page.locator('text=75.5 кг')).toBeVisible();
      await expect(page.locator('text=Weight test note')).toBeVisible();
    });

    // Добавление замеров тела
    await test.step('Add body measurements', async () => {
      await page.click('text=Замеры тела');
      await page.fill('input#chest', '100');
      await page.fill('input#waist', '80');
      await page.fill('input#hips', '100');
      await page.fill('textarea', 'Body measurements test note');
      await page.click('button:has-text("Сохранить измерения")');
      
      // Проверяем, что измерения появились в истории
      await expect(page.locator('text=100 см')).toBeVisible();
      await expect(page.locator('text=Body measurements test note')).toBeVisible();
    });

    // Добавление состава тела
    await test.step('Add body composition', async () => {
      await page.click('text=Состав тела');
      await page.fill('input[placeholder*="жира"]', '20');
      await page.fill('input[placeholder*="мышц"]', '40');
      await page.fill('input[placeholder*="воды"]', '60');
      await page.fill('textarea', 'Composition test note');
      await page.click('button:has-text("Сохранить")');
      
      // Проверяем, что данные появились в истории
      await expect(page.locator('text=20%')).toBeVisible();
      await expect(page.locator('text=Composition test note')).toBeVisible();
    });

    // Проверка аналитики
    await test.step('Check analytics', async () => {
      await page.click('text=Аналитика');
      
      // Проверяем графики
      await expect(page.locator('canvas')).toHaveCount(4);
      
      // Проверяем историю измерений
      await expect(page.locator('text=75.5 кг')).toBeVisible();
      await expect(page.locator('text=100 см')).toBeVisible();
      await expect(page.locator('text=20%')).toBeVisible();
    });

    // Тестирование экспорта/импорта
    await test.step('Test export/import', async () => {
      // Экспорт
      const downloadPromise = page.waitForEvent('download');
      await page.click('text=Экспортировать данные');
      const download = await downloadPromise;
      
      // Очистка данных
      await page.click('text=Очистить все данные');
      await page.click('text=OK');
      
      // Проверяем, что данные очистились
      await expect(page.locator('text=75.5 кг')).toBeHidden();
      
      // Импорт
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.click('text=Импортировать данные')
      ]);
      await fileChooser.setFiles(await download.path());
      
      // Проверяем, что данные восстановились
      await expect(page.locator('text=75.5 кг')).toBeVisible();
    });

    // Тестирование редактирования
    await test.step('Test measurement editing', async () => {
      await page.click('button[title="Редактировать"]');
      await page.fill('input[type="number"]', '76.5');
      await page.click('button:has-text("Сохранить")');
      
      // Проверяем, что значение обновилось
      await expect(page.locator('text=76.5 кг')).toBeVisible();
    });

    // Тестирование удаления
    await test.step('Test measurement deletion', async () => {
      const measurementText = '76.5 кг';
      await expect(page.locator(`text=${measurementText}`)).toBeVisible();
      
      await page.click('button[title="Удалить"]');
      await page.click('text=OK');
      
      // Проверяем, что измерение удалилось
      await expect(page.locator(`text=${measurementText}`)).toBeHidden();
    });
  });
}); 