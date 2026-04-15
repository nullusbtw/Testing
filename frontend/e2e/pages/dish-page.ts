import { expect, type Locator, type Page } from '@playwright/test';
import type { DishData } from '../fixtures';

export class DishPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly sizeInput: Locator;
  readonly categorySelect: Locator;
  readonly productSelect: Locator;
  readonly quantityInput: Locator;
  readonly caloriesInput: Locator;
  readonly proteinsInput: Locator;
  readonly fatsInput: Locator;
  readonly carbsInput: Locator;
  readonly veganCheckbox: Locator;
  readonly glutenFreeCheckbox: Locator;
  readonly sugarFreeCheckbox: Locator;
  readonly submitButton: Locator;
  readonly addProductButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('[data-testid="dish-name"]');
    this.sizeInput = page.locator('[data-testid="dish-size"]');
    this.categorySelect = page.locator('[data-testid="dish-category"]');
    this.productSelect = page.locator('[data-testid="dish-product-select"]');
    this.quantityInput = page.locator('[data-testid="dish-quantity-input"]');
    this.caloriesInput = page.locator('[data-testid="dish-calories"]');
    this.proteinsInput = page.locator('[data-testid="dish-proteins"]');
    this.fatsInput = page.locator('[data-testid="dish-fats"]');
    this.carbsInput = page.locator('[data-testid="dish-carbs"]');
    this.veganCheckbox = page.locator('[data-testid="dish-vegan"]');
    this.glutenFreeCheckbox = page.locator('[data-testid="dish-gluten-free"]');
    this.sugarFreeCheckbox = page.locator('[data-testid="dish-sugar-free"]');
    this.submitButton = page.locator('[data-testid="dish-submit"]');
    this.addProductButton = page.locator('[data-testid="dish-add-product"]');
    this.deleteButton = page.locator('button:has-text("Удалить")').first();
  }

  async gotoNew() {
    await this.page.goto('/dishes/new');
    await this.page.waitForLoadState('networkidle');
  }

  async fill(dish: Partial<DishData>) {
    if (dish.name !== undefined) {
      await this.nameInput.fill(dish.name);
    }

    if (dish.size !== undefined) {
      await this.sizeInput.fill(String(dish.size));
    }

    if (dish.category !== undefined && dish.category !== '') {
      await this.categorySelect.selectOption(dish.category);
    }

    if (dish.name !== undefined) {
      await this.addFirstProductIfAvailable();
    }

    if (dish.calories !== undefined) {
      await this.caloriesInput.fill(String(dish.calories));
    }
    if (dish.proteins !== undefined) {
      await this.proteinsInput.fill(String(dish.proteins));
    }
    if (dish.fats !== undefined) {
      await this.fatsInput.fill(String(dish.fats));
    }
    if (dish.carbs !== undefined) {
      await this.carbsInput.fill(String(dish.carbs));
    }

    if (dish.vegan !== undefined) {
      const isEnabled = await this.veganCheckbox.isEnabled();
      if (isEnabled) {
        if (dish.vegan) {
          await this.veganCheckbox.check();
        } else {
          await this.veganCheckbox.uncheck();
        }
      }
    }

    if (dish.glutenFree !== undefined) {
      const isEnabled = await this.glutenFreeCheckbox.isEnabled();
      if (isEnabled) {
        if (dish.glutenFree) {
          await this.glutenFreeCheckbox.check();
        } else {
          await this.glutenFreeCheckbox.uncheck();
        }
      }
    }

    if (dish.sugarFree !== undefined) {
      const isEnabled = await this.sugarFreeCheckbox.isEnabled();
      if (isEnabled) {
        if (dish.sugarFree) {
          await this.sugarFreeCheckbox.check();
        } else {
          await this.sugarFreeCheckbox.uncheck();
        }
      }
    }
    if (dish.sugarFree && await this.sugarFreeCheckbox.isEnabled().catch(() => false)) {
      await this.sugarFreeCheckbox.check();
    }
  }

  async addFirstProductIfAvailable() {
    const firstOption = this.productSelect.locator('option').first();
    const productValue = await firstOption.getAttribute('value').catch(() => '');
    if (productValue && productValue !== '') {
      await this.productSelect.selectOption(productValue);
      await this.quantityInput.fill('50');
      await this.addProductButton.click();
      await this.page.waitForTimeout(300);
    }
  }

  async submit() {
    await this.submitButton.click();
  }

  async create(dish: Partial<DishData>) {
    await this.fill(dish);
    await this.submit();
  }

  getIdFromUrl(): number | null {
    const match = this.page.url().match(/\/dishes\/(\d+)$/);
    return match ? Number(match[1]) : null;
  }

  async delete() {
    if (await this.deleteButton.isVisible().catch(() => false)) {
      await this.deleteButton.click();
      await this.page.waitForURL(/\/dishes/).catch(() => {});
    }
  }

  async expectValidationErrorOrStayOnForm() {
    const isError = await this.page.locator('[style*="crimson"]').isVisible().catch(() => false);
    expect(isError || this.page.url().includes('/dishes/new')).toBeTruthy();
  }
}
