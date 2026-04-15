import { expect, type Locator, type Page } from '@playwright/test';
import type { ProductData } from '../fixtures';

export class ProductPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly categorySelect: Locator;
  readonly cookingSelect: Locator;
  readonly caloriesInput: Locator;
  readonly proteinsInput: Locator;
  readonly fatsInput: Locator;
  readonly carbsInput: Locator;
  readonly veganCheckbox: Locator;
  readonly glutenFreeCheckbox: Locator;
  readonly sugarFreeCheckbox: Locator;
  readonly submitButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('[data-testid="product-name"]');
    this.categorySelect = page.locator('[data-testid="product-category"]');
    this.cookingSelect = page.locator('[data-testid="product-cooking-need"]');
    this.caloriesInput = page.locator('[data-testid="product-calories"]');
    this.proteinsInput = page.locator('[data-testid="product-proteins"]');
    this.fatsInput = page.locator('[data-testid="product-fats"]');
    this.carbsInput = page.locator('[data-testid="product-carbs"]');
    this.veganCheckbox = page.locator('[data-testid="product-vegan"]');
    this.glutenFreeCheckbox = page.locator('[data-testid="product-gluten-free"]');
    this.sugarFreeCheckbox = page.locator('[data-testid="product-sugar-free"]');
    this.submitButton = page.locator('[data-testid="product-submit"]');
    this.deleteButton = page.locator('button:has-text("Удалить")').first();
  }

  async gotoNew() {
    await this.page.goto('/products/new');
    await this.page.waitForLoadState('networkidle');
  }

  async fill(product: Partial<ProductData>) {
    if (product.name !== undefined) {
      await this.nameInput.fill(product.name);
    }

    if (product.category !== undefined && product.category !== '') {
      await this.categorySelect.selectOption(product.category);
    }

    if (product.cookingNeed !== undefined && product.cookingNeed !== '') {
      await this.cookingSelect.selectOption(product.cookingNeed);
    }

    if (product.caloriesPer100 !== undefined) {
      await this.caloriesInput.fill(String(product.caloriesPer100));
    }
    if (product.proteinsPer100 !== undefined) {
      await this.proteinsInput.fill(String(product.proteinsPer100));
    }
    if (product.fatsPer100 !== undefined) {
      await this.fatsInput.fill(String(product.fatsPer100));
    }
    if (product.carbsPer100 !== undefined) {
      await this.carbsInput.fill(String(product.carbsPer100));
    }

    if (product.vegan !== undefined) {
      const isEnabled = await this.veganCheckbox.isEnabled();
      if (isEnabled) {
        if (product.vegan) {
          await this.veganCheckbox.check();
        } else {
          await this.veganCheckbox.uncheck();
        }
      }
    }

    if (product.glutenFree !== undefined) {
      const isEnabled = await this.glutenFreeCheckbox.isEnabled();
      if (isEnabled) {
        if (product.glutenFree) {
          await this.glutenFreeCheckbox.check();
        } else {
          await this.glutenFreeCheckbox.uncheck();
        }
      }
    }

    if (product.sugarFree !== undefined) {
      const isEnabled = await this.sugarFreeCheckbox.isEnabled();
      if (isEnabled) {
        if (product.sugarFree) {
          await this.sugarFreeCheckbox.check();
        } else {
          await this.sugarFreeCheckbox.uncheck();
        }
      }
    }
  }

  async submit() {
    await this.submitButton.click();
  }

  async create(product: Partial<ProductData>) {
    await this.fill(product);
    await this.submit();
  }

  getIdFromUrl(): number | null {
    const match = this.page.url().match(/\/products\/(\d+)$/);
    return match ? Number(match[1]) : null;
  }

  async assertCreated(name: string) {
    await expect(this.page.locator('h2', { hasText: name }).first()).toBeVisible();
  }

  async delete() {
    if (await this.deleteButton.isVisible().catch(() => false)) {
      await this.deleteButton.click();
      await this.page.waitForURL(/\/products/).catch(() => {});
    }
  }

  async expectValidationErrorOrStayOnForm() {
    const isError = await this.page.locator('[style*="crimson"]').isVisible().catch(() => false);
    expect(isError || this.page.url().includes('/products/new')).toBeTruthy();
  }
}
