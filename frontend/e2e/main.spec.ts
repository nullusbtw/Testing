import { test, expect } from './fixtures';
import { ProductPage } from './pages/product-page';
import { DishPage } from './pages/dish-page';

// CRUD операции с продуктами и блюдами
test.describe('CRUD операции', () => {
  
  test.describe('Создание продуктов', () => {
    let createdProductId: number | null = null;

    test.afterEach(async ({ page }) => {
      if (createdProductId) {
        await page.goto(`/products/${createdProductId}`);
        const deleteBtn = page.locator('button:has-text("Удалить")').first();
        if (await deleteBtn.isVisible().catch(() => false)) {
          await deleteBtn.click();
          await page.waitForURL(/\/products$/).catch(() => {});
        }
        createdProductId = null;
      }
    });

    test('Создание продукта с валидными данными', async ({ page, testData }) => {
      const product = testData.products.valid[0];
      const productPage = new ProductPage(page);

      await productPage.gotoNew();
      await productPage.create(product);
      await page.waitForURL(/\/products\/[0-9]+$/);

      createdProductId = productPage.getIdFromUrl();
      expect(createdProductId).toBeGreaterThan(0);
      await productPage.assertCreated(product.name);
    });

    test('Создание второго продукта с другими данными', async ({ page, testData }) => {
      const product = testData.products.valid[1];
      const productPage = new ProductPage(page);

      await productPage.gotoNew();
      await productPage.create(product);
      await page.waitForURL(/\/products\/[0-9]+$/);

      createdProductId = productPage.getIdFromUrl();
      expect(createdProductId).toBeGreaterThan(0);
    });


    test('BVA: 0 калорий', async ({ page, testData }) => {
      const product = testData.products.boundary[0];
      const productPage = new ProductPage(page);

      await productPage.gotoNew();
      await productPage.create(product);
      await page.waitForURL(/\/products\/[0-9]+$/);

      createdProductId = productPage.getIdFromUrl();
      expect(createdProductId).toBeGreaterThan(0);
    });

    test('1 калория', async ({ page, testData }) => {
      const product = testData.products.boundary[1];
      const productPage = new ProductPage(page);

      await productPage.gotoNew();
      await productPage.create(product);
      await page.waitForURL(/\/products\/[0-9]+$/);

      createdProductId = productPage.getIdFromUrl();
      expect(createdProductId).toBeGreaterThan(0);
    });

    test('1000 калорий', async ({ page, testData }) => {
      const product = testData.products.boundary[2];
      const productPage = new ProductPage(page);

      await productPage.gotoNew();
      await productPage.create(product);
      await page.waitForURL(/\/products\/[0-9]+$/);

      createdProductId = productPage.getIdFromUrl();
      expect(createdProductId).toBeGreaterThan(0);
    });

    test('-1 калория', async ({ page, testData }) => {
      const productPage = new ProductPage(page);
      const product = testData.products.invalid[2];

      await productPage.gotoNew();
      await productPage.create(product);
      await productPage.expectValidationErrorOrStayOnForm();
    });

    test('Невалидные данные: пустое имя', async ({ page, testData }) => {
      const productPage = new ProductPage(page);
      const product = testData.products.invalid[0];

      await productPage.gotoNew();
      await productPage.create(product);
      await productPage.expectValidationErrorOrStayOnForm();
    });

    test('Отрицательные калории', async ({ page, testData }) => {
      const productPage = new ProductPage(page);
      const product = testData.products.invalid[2];

      await productPage.gotoNew();
      await productPage.create(product);
      await productPage.expectValidationErrorOrStayOnForm();
    });
  });

  test.describe('Создание блюд', () => {
    let createdDishId: number | null = null;

    test.afterEach(async ({ page }) => {
      if (createdDishId) {
        await page.goto(`/dishes/${createdDishId}`);
        const deleteBtn = page.locator('button:has-text("Удалить")').first();
        if (await deleteBtn.isVisible().catch(() => false)) {
          await deleteBtn.click();
          await page.waitForURL(/\/dishes$/).catch(() => {});
        }
        createdDishId = null;
      }
    });

    test('Создание блюда с валидными данными', async ({ page, testData }) => {
      const dish = testData.dishes.valid[0];
      const dishPage = new DishPage(page);

      await dishPage.gotoNew();
      await dishPage.create(dish);
      await page.waitForURL(/\/dishes\/[0-9]+$/);

      createdDishId = dishPage.getIdFromUrl();
      expect(createdDishId).toBeGreaterThan(0);
    });

    test('Создание веганского блюда', async ({ page, testData }) => {
      const dish = testData.dishes.valid[1];
      const dishPage = new DishPage(page);

      await dishPage.gotoNew();
      await dishPage.create(dish);
      await page.waitForURL(/\/dishes\/[0-9]+$/);

      createdDishId = dishPage.getIdFromUrl();
      expect(createdDishId).toBeGreaterThan(0);
    });

    test('Невалидные данные: пустое имя', async ({ page, testData }) => {
      const dishPage = new DishPage(page);
      const dish = testData.dishes.invalid[0];

      await dishPage.gotoNew();
      await dishPage.create(dish);
      await dishPage.expectValidationErrorOrStayOnForm();
    });

    test('Невалидные данные: пустая категория', async ({ page, testData }) => {
      const dishPage = new DishPage(page);
      const dish = testData.dishes.invalid[1];

      await dishPage.gotoNew();
      await dishPage.create(dish);
      await dishPage.expectValidationErrorOrStayOnForm();
    });
  });

  test.describe('Расчет КБЖУ', () => {
    test('Расчет и отображение КБЖУ в блюде', async ({ page, testData }) => {
      const dish = testData.dishes.valid[0];
      const dishPage = new DishPage(page);

      await dishPage.gotoNew();
      await dishPage.create(dish);
      await page.waitForURL(/\/dishes\/\d+$/);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const pageContent = await page.content();
      const hasCalories = pageContent.toLowerCase().includes('ккал/порция:');

      if (!hasCalories) {
        console.log('Page content snippet:', pageContent.substring(0, 1000));
      }

      expect(hasCalories).toBeTruthy();
    });

    test('Отображение калорий на 100г для продукта', async ({ page, testData }) => {
      const product = testData.products.valid[0]; // Куриная грудка 165 ккал
      const productPage = new ProductPage(page);

      await productPage.gotoNew();
      await productPage.create(product);
      await page.waitForURL(/\/products\/\d+$/);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const pageText = await page.content();
      const hasCalories = pageText.toLowerCase().includes('ккал/100г:');

      if (!hasCalories) {
        console.log('Product page content snippet:', pageText.substring(0, 1000));
      }

      expect(hasCalories).toBeTruthy();
    });
  });

  test.describe('Удаление продуктов', () => {
    test('Создание и удаление продукта', async ({ page, testData }) => {
      const product = testData.products.valid[0];
      const productPage = new ProductPage(page);

      await productPage.gotoNew();
      await productPage.create(product);
      await page.waitForURL(/\/products\/\d+$/);

      const productId = productPage.getIdFromUrl();
      expect(productId).toBeGreaterThan(0);

      await productPage.delete();
      expect(page.url()).toContain('/products');
    });

    test('Удаление нескольких продуктов', async ({ page, testData }) => {
      const products = testData.products.valid;
      let deletedCount = 0;

      for (const product of products.slice(0, 2)) {
        const productPage = new ProductPage(page);

        await productPage.gotoNew();
        await productPage.create(product);
        await page.waitForURL(/\/products\/\d+$/);

        const id = productPage.getIdFromUrl();
        if (id) {
          deletedCount += 1;
          await productPage.delete();
        }
      }

      expect(deletedCount).toBeGreaterThan(0);
    });
  });

  test.describe('Удаление блюд', () => {
    test('Создание и удаление блюда', async ({ page, testData }) => {
      const dish = testData.dishes.valid[0];
      const dishPage = new DishPage(page);

      await dishPage.gotoNew();
      await dishPage.create(dish);
      await page.waitForURL(/\/dishes\/\d+$/);

      const dishId = dishPage.getIdFromUrl();
      expect(dishId).toBeGreaterThan(0);

      await dishPage.delete();
      expect(page.url()).toContain('/dishes');
    });

    test('Удаление нескольких блюд', async ({ page, testData }) => {
      const dishes = testData.dishes.valid;
      let deletedCount = 0;

      for (const dish of dishes) {
        const dishPage = new DishPage(page);

        await dishPage.gotoNew();
        await dishPage.create(dish);
        await page.waitForURL(/\/dishes\/\d+$/);

        const id = dishPage.getIdFromUrl();
        if (id) {
          deletedCount += 1;
          await dishPage.delete();
        }
      }

      expect(deletedCount).toBeGreaterThan(0);
    });

    test('Удаление веганского блюда', async ({ page, testData }) => {
      const veganDish = testData.dishes.valid.find(d => d.vegan);
      expect(veganDish).toBeTruthy();
      const dishPage = new DishPage(page);

      await dishPage.gotoNew();
      await dishPage.create(veganDish!);
      await page.waitForURL(/\/dishes\/\d+$/);

      const dishId = dishPage.getIdFromUrl();
      expect(dishId).toBeGreaterThan(0);

      await dishPage.delete();
      expect(page.url()).toContain('/dishes');
    });
  });
});
