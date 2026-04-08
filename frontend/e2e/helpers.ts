import { Page, expect } from '@playwright/test';

export async function createProduct(page: Page, product: {
  name?: string;
  category?: string;
  cookingNeed?: string;
  caloriesPer100?: number;
  proteinsPer100?: number;
  fatsPer100?: number;
  carbsPer100?: number;
  vegan?: boolean;
  glutenFree?: boolean;
  sugarFree?: boolean;
}) {
  // Заполняем поля
  if (product.name !== undefined) {
    const nameInput = page.locator('label:has-text("Название") + input, input[placeholder*="Назва"], input[placeholder*="название"], input[type="text"], input:not([type])').first();
    await nameInput.fill(product.name);
  }

  if (product.category !== undefined) {
    const selects = page.locator('select');
    await selects.first().selectOption(product.category);
  }

  if (product.cookingNeed !== undefined) {
    const selects = page.locator('select');
    const secondSelect = selects.nth(1);
    await secondSelect.selectOption(product.cookingNeed);
  }

  // Числовые поля
  const numberInputs = page.locator('input[type="number"]');
  if (product.caloriesPer100 !== undefined) {
    await numberInputs.nth(0).fill(String(product.caloriesPer100));
  }
  if (product.proteinsPer100 !== undefined) {
    await numberInputs.nth(1).fill(String(product.proteinsPer100));
  }
  if (product.fatsPer100 !== undefined) {
    await numberInputs.nth(2).fill(String(product.fatsPer100));
  }
  if (product.carbsPer100 !== undefined) {
    await numberInputs.nth(3).fill(String(product.carbsPer100));
  }

  // Чекбоксы
  const checkboxes = page.locator('input[type="checkbox"]');
  if (product.vegan) await checkboxes.nth(0).check();
  if (product.glutenFree) await checkboxes.nth(1).check();
  if (product.sugarFree) await checkboxes.nth(2).check();

  // Отправляем
  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();
}

export async function createDish(page: Page, dish: {
  name?: string;
  category?: string;
  calories?: number;
  proteins?: number;
  fats?: number;
  carbs?: number;
  size?: number;
  vegan?: boolean;
  glutenFree?: boolean;
  sugarFree?: boolean;
}) {
  if (dish.name !== undefined) {
    const nameInput = page.locator('label:has-text("Название") + input, input[placeholder*="Назва"], input[placeholder*="название"], input[type="text"], input:not([type])').first();
    await nameInput.fill(dish.name);
  }

  if (dish.category !== undefined) {
    const selects = page.locator('select');
    const categorySelect = selects.first();
    await categorySelect.selectOption(dish.category);
  }

  // Добавляем продукт в состав
  const selects = page.locator('select');
  const productSelect = selects.nth(1);
  
  try {
    const firstOption = productSelect.locator('option').first();
    const productValue = await firstOption.getAttribute('value');
    
    if (productValue && productValue !== '') {
      await productSelect.selectOption(productValue);
      
      const allNumberInputs = page.locator('input[type="number"]');
      const quantityInput = allNumberInputs.first();
      await quantityInput.fill('50');
      
      const addProductButton = page.locator('button:has-text("Добавить")').first();
      await addProductButton.click();
      
      await page.waitForTimeout(300);
    }
  } catch (e) {
  }

  const allNumberInputs = page.locator('input[type="number"]');
  
  const inputArray = await allNumberInputs.all();
  
  if (dish.size !== undefined && inputArray.length > 0) {
    await inputArray[0].fill(String(dish.size));
  }
  if (dish.calories !== undefined && inputArray.length > 1) {
    await inputArray[1].fill(String(dish.calories));
  }
  if (dish.proteins !== undefined && inputArray.length > 2) {
    await inputArray[2].fill(String(dish.proteins));
  }
  if (dish.fats !== undefined && inputArray.length > 3) {
    await inputArray[3].fill(String(dish.fats));
  }
  if (dish.carbs !== undefined && inputArray.length > 4) {
    await inputArray[4].fill(String(dish.carbs));
  }

  const checkboxes = page.locator('input[type="checkbox"]');
  if (dish.vegan) {
    const veganCheckbox = checkboxes.nth(0);
    const isEnabled = await veganCheckbox.isEnabled().catch(() => false);
    if (isEnabled) await veganCheckbox.check();
  }
  if (dish.glutenFree) {
    const glutenCheckbox = checkboxes.nth(1);
    const isEnabled = await glutenCheckbox.isEnabled().catch(() => false);
    if (isEnabled) await glutenCheckbox.check();
  }
  if (dish.sugarFree) {
    const sugarCheckbox = checkboxes.nth(2);
    const isEnabled = await sugarCheckbox.isEnabled().catch(() => false);
    if (isEnabled) await sugarCheckbox.check();
  }
  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();
}

export function getIdFromUrl(url: string, pathPrefix: string): number | null {
  const match = url.match(new RegExp(`/${pathPrefix}/(\\d+)$`));
  return match ? parseInt(match[1], 10) : null;
}

export async function deleteProduct(page: Page, id: number) {
  await page.goto(`/products/${id}`);
  const deleteBtn = page.locator('button:has-text("Удалить")').first();
  if (await deleteBtn.isVisible()) {
    await deleteBtn.click();
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  }
}

export async function deleteDish(page: Page, id: number) {
  await page.goto(`/dishes/${id}`);
  const deleteBtn = page.locator('button:has-text("Удалить")').first();
  if (await deleteBtn.isVisible()) {
    await deleteBtn.click();
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  }
}
