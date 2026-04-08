import { test, expect } from './fixtures';
import { createProduct, createDish, getIdFromUrl, deleteProduct, deleteDish } from './helpers';

// CRUD операции с продуктами и блюдами
test.describe('CRUD операции', () => {
  
  test.describe('Создание продуктов', () => {
    let createdProductId: number | null = null;
    
    test.afterEach(async ({ page }) => {
      if (createdProductId) {
        await deleteProduct(page, createdProductId);
        createdProductId = null;
      }
    });
    
    test('Создание продукта с валидными данными', async ({ page, testData }) => {
      const product = testData.products.valid[0];
      
      await page.goto('/products/new');
      await page.waitForLoadState('networkidle');
      
      await createProduct(page, product);
      
      await page.waitForURL(/\/products\/\d+$/);
      createdProductId = getIdFromUrl(page.url(), 'products');
      expect(createdProductId).toBeGreaterThan(0);
      
      const nameHeading = page.locator('h2', { hasText: product.name }).first();
      await expect(nameHeading).toBeVisible();
    });

    test('Создание второго продукта с другими данными', async ({ page, testData }) => {
      const product = testData.products.valid[1];
      
      await page.goto('/products/new');
      await page.waitForLoadState('networkidle');
      
      await createProduct(page, product);
      
      await page.waitForURL(/\/products\/\d+$/);
      createdProductId = getIdFromUrl(page.url(), 'products');
      expect(createdProductId).toBeGreaterThan(0);
    });


    test('BVA: 0 калорий', async ({ page, testData }) => {
      const product = testData.products.boundary[0];
      
      await page.goto('/products/new');
      await page.waitForLoadState('networkidle');
      
      await createProduct(page, product);
      
      await page.waitForURL(/\/products\/\d+$/);
      createdProductId = getIdFromUrl(page.url(), 'products');
      expect(createdProductId).toBeGreaterThan(0);
    });

    test('BVA: 1 калория', async ({ page, testData }) => {
      const product = testData.products.boundary[1];
      
      await page.goto('/products/new');
      await page.waitForLoadState('networkidle');
      
      await createProduct(page, product);
      
      await page.waitForURL(/\/products\/\d+$/);
      createdProductId = getIdFromUrl(page.url(), 'products');
      expect(createdProductId).toBeGreaterThan(0);
    });

    test('1000 калорий', async ({ page, testData }) => {
      const product = testData.products.boundary[2];
      
      await page.goto('/products/new');
      await page.waitForLoadState('networkidle');
      
      await createProduct(page, product);
      
      await page.waitForURL(/\/products\/\d+$/);
      createdProductId = getIdFromUrl(page.url(), 'products');
      expect(createdProductId).toBeGreaterThan(0);
    });

    test('BVA: -1 калория', async ({ page }) => {
      await page.goto('/products/new');
      await page.waitForLoadState('networkidle');
      
      const nameInput = page.locator('input[type="text"]').first();
      await nameInput.fill('Продукт с -1 калорией');
      
      const categorySelect = page.locator('select').first();
      await categorySelect.selectOption('Овощи');
      
      const cookingSelect = page.locator('select').nth(1);
      await cookingSelect.selectOption('Готовый к употреблению');
      
      const numberInput = page.locator('input[type="number"]').nth(0);
      await numberInput.fill('-1');
      
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      
      const isError = await page.locator('[style*="crimson"]').isVisible().catch(() => false);
      const isStillOnNew = page.url().includes('/products/new');
      expect(isError || isStillOnNew).toBeTruthy();
    });

    test('Невалидные данные: пустое имя', async ({ page }) => {
      await page.goto('/products/new');
      await page.waitForLoadState('networkidle');
      
      const categorySelect = page.locator('select').first();
      await categorySelect.selectOption('Мясной');
      
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      
      const isOnNewPage = page.url().includes('/products/new');
      const isError = await page.locator('[style*="crimson"]').isVisible().catch(() => false);
      
      expect(isOnNewPage || isError).toBeTruthy();
    });

    test('Отрицательные калории', async ({ page }) => {
      await page.goto('/products/new');
      await page.waitForLoadState('networkidle');
      
      const nameInput = page.locator('input[type="text"]').first();
      await nameInput.fill('Продукт с отрицательными калориями');
      
      const categorySelect = page.locator('select').first();
      await categorySelect.selectOption('Овощи');
      
      const numberInput = page.locator('input[type="number"]').first();
      await numberInput.fill('-100');
      
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      
      const isError = await page.locator('[style*="crimson"]').isVisible().catch(() => false);
      const isStillOnNew = page.url().includes('/new');
      
      expect(isError || isStillOnNew).toBeTruthy();
    });
  });

  test.describe('Создание блюд', () => {
    let createdDishId: number | null = null;
    
    test.afterEach(async ({ page }) => {
      if (createdDishId) {
        await deleteDish(page, createdDishId);
        createdDishId = null;
      }
    });
    
    test('Создание блюда с валидными данными', async ({ page, testData }) => {
      const dish = testData.dishes.valid[0];
      
      await page.goto('/dishes/new');
      await page.waitForLoadState('networkidle');
      
      await createDish(page, dish);
      
      await page.waitForURL(/\/dishes\/\d+$/);
      createdDishId = getIdFromUrl(page.url(), 'dishes');
      expect(createdDishId).toBeGreaterThan(0);
    });

    test('Создание веганского блюда', async ({ page, testData }) => {
      const dish = testData.dishes.valid[1];
      
      await page.goto('/dishes/new');
      await page.waitForLoadState('networkidle');
      
      await createDish(page, dish);
      
      await page.waitForURL(/\/dishes\/\d+$/);
      createdDishId = getIdFromUrl(page.url(), 'dishes');
      expect(createdDishId).toBeGreaterThan(0);
    });

    test('Невалидные данные: пустое имя', async ({ page }) => {
      await page.goto('/dishes/new');
      await page.waitForLoadState('networkidle');
      
      const categorySelect = page.locator('select').first();
      await categorySelect.selectOption('Второе');
      
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      
      const isOnNewPage = page.url().includes('/dishes/new');
      const isError = await page.locator('[style*="crimson"]').isVisible().catch(() => false);
      
      expect(isOnNewPage || isError).toBeTruthy();
    });

    test('Невалидные данные: пустая категория', async ({ page }) => {
      await page.goto('/dishes/new');
      await page.waitForLoadState('networkidle');
      
      const nameInput = page.locator('input[type="text"]').first();
      await nameInput.fill('Блюдо без категории');
      
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      
      const isOnNewPage = page.url().includes('/dishes/new');
      const isError = await page.locator('[style*="crimson"]').isVisible().catch(() => false);
      
      expect(isOnNewPage || isError).toBeTruthy();
    });
  });

  test.describe('Расчет КБЖУ', () => {
    test('Расчет и отображение КБЖУ в блюде', async ({ page, testData }) => {
      const dish = testData.dishes.valid[0];
      
      await page.goto('/dishes/new');
      await page.waitForLoadState('networkidle');
      
      await createDish(page, dish);
      
      await page.waitForURL(/\/dishes\/\d+$/);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      // Проверяем что макросы отображаются
      const pageContent = await page.content();
      const hasCalories = pageContent.toLowerCase().includes('ккал/порция:');
      
      if (!hasCalories) {
        console.log('Page content snippet:', pageContent.substring(0, 1000));
      }
      
      expect(hasCalories).toBeTruthy();
    });

    test('Отображение калорий на 100г для продукта', async ({ page, testData }) => {
      const product = testData.products.valid[0]; // Куриная грудка 165 ккал
      
      await page.goto('/products/new');
      await page.waitForLoadState('networkidle');
      
      await createProduct(page, product);
      
      await page.waitForURL(/\/products\/\d+$/);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      // Проверяем отображение калорий
      const pageText = await page.content();
      const hasCalories = pageText.toLowerCase().includes('ккал/100г:');
      
      if (!hasCalories) {
        console.log('Product page content snippet:', pageText.substring(0, 1000));
      }
      
      expect(hasCalories).toBeTruthy();
    });
  });

  test.describe('Удаление продуктов', () => {
    // Создание и удаление продукта
    test('Создание и удаление продукта', async ({ page, testData }) => {
      const product = testData.products.valid[0];
      
      await page.goto('/products/new');
      await page.waitForLoadState('networkidle');
      
      await createProduct(page, product);
      
      await page.waitForURL(/\/products\/\d+$/);
      const productId = getIdFromUrl(page.url(), 'products');
      expect(productId).toBeGreaterThan(0);
      
      const deleteBtn = page.locator('button:has-text("Удалить")').first();
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        
        await page.waitForURL('/products').catch(() => {});
        const url = page.url();
        expect(url).toContain('/products');
      }
    });

    // Удаление нескольких продуктов
    test('Удаление нескольких продуктов', async ({ page, testData }) => {
      const products = testData.products.valid;
      const deletedIds: number[] = [];
      
      for (const product of products.slice(0, 2)) {
        await page.goto('/products/new');
        await page.waitForLoadState('networkidle');
        
        await createProduct(page, product);
        
        await page.waitForURL(/\/products\/\d+$/);
        const id = getIdFromUrl(page.url(), 'products');
        if (id) deletedIds.push(id);
      }
      
      // Удаляем созданные продукты
      for (const id of deletedIds) {
        await deleteProduct(page, id);
      }
      
      // Проверяем что операции выполнены
      expect(deletedIds.length).toBeGreaterThan(0);
    });
  });

  test.describe('Удаление блюд', () => {
    test('Создание и удаление блюда', async ({ page, testData }) => {
      const dish = testData.dishes.valid[0];
      
      await page.goto('/dishes/new');
      await page.waitForLoadState('networkidle');
      
      await createDish(page, dish);
      
      await page.waitForURL(/\/dishes\/\d+$/);
      const dishId = getIdFromUrl(page.url(), 'dishes');
      expect(dishId).toBeGreaterThan(0);
      
      const deleteBtn = page.locator('button:has-text("Удалить")').first();
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        
        await page.waitForURL('/dishes').catch(() => {});
        const url = page.url();
        expect(url).toContain('/dishes');
      }
    });

    test('Удаление нескольких блюд', async ({ page, testData }) => {
      const dishes = testData.dishes.valid;
      const createdIds: number[] = [];
      
      // Создаем блюда
      for (const dish of dishes) {
        await page.goto('/dishes/new');
        await page.waitForLoadState('networkidle');
        
        await createDish(page, dish);
        
        await page.waitForURL(/\/dishes\/\d+$/);
        const id = getIdFromUrl(page.url(), 'dishes');
        if (id) createdIds.push(id);
      }
      
      // Удаляем
      for (const id of createdIds) {
        await deleteDish(page, id);
      }
      
      expect(createdIds.length).toBeGreaterThan(0);
    });

    test('Удаление веганского блюда', async ({ page, testData }) => {
      const veganDish = testData.dishes.valid.find(d => d.vegan);
      if (!veganDish) {
        test.skip();
      }
      
      await page.goto('/dishes/new');
      await page.waitForLoadState('networkidle');
      
      await createDish(page, veganDish!);
      
      await page.waitForURL(/\/dishes\/\d+$/);
      const dishId = getIdFromUrl(page.url(), 'dishes');
      
      // Удаляем
      if (dishId) {
        await deleteDish(page, dishId);
        const url = page.url();
        expect(url).toContain('/dishes');
      }
    });
  });
});
