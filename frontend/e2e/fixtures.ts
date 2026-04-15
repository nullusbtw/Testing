import { test as base, expect } from '@playwright/test';

export type TestData = {
  products: {
    valid: ProductData[];
    boundary: ProductData[];
    invalid: ProductData[];
  };
  dishes: {
    valid: DishData[];
    boundary: DishData[];
    invalid: DishData[];
  };
};

export interface ProductData {
  name: string;
  category: string;
  cookingNeed: string;
  caloriesPer100?: number;
  proteinsPer100?: number;
  fatsPer100?: number;
  carbsPer100?: number;
  vegan?: boolean;
  glutenFree?: boolean;
  sugarFree?: boolean;
}

export interface DishData {
  name: string;
  category: string;
  calories?: number;
  proteins?: number;
  fats?: number;
  carbs?: number;
  size?: number;
  vegan?: boolean;
  glutenFree?: boolean;
  sugarFree?: boolean;
}

const createTestData = (): TestData => ({
  products: {
    valid: [
      {
        name: 'Куриная грудка',
        category: 'Мясной',
        cookingNeed: 'Требует приготовления',
        caloriesPer100: 165,
        proteinsPer100: 31,
        fatsPer100: 3.6,
        carbsPer100: 0,
      },
      {
        name: 'Яблоко',
        category: 'Сладости',
        cookingNeed: 'Готовый к употреблению',
        caloriesPer100: 52,
        proteinsPer100: 0.3,
        fatsPer100: 0.2,
        carbsPer100: 13.8,
      },
    ],
    boundary: [
      {
        name: 'Граничное значение 0 калорий',
        category: 'Овощи',
        cookingNeed: 'Готовый к употреблению',
        caloriesPer100: 0,
        proteinsPer100: 0,
        fatsPer100: 0,
        carbsPer100: 0,
      },
      {
        name: '1 калория',
        category: 'Овощи',
        cookingNeed: 'Готовый к употреблению',
        caloriesPer100: 1,
        proteinsPer100: 0.1,
        fatsPer100: 0.1,
        carbsPer100: 0.1,
      },
      {
        name: '1000 калорий',
        category: 'Жидкость',
        cookingNeed: 'Готовый к употреблению',
        caloriesPer100: 1000,
        proteinsPer100: 100,
        fatsPer100: 100,
        carbsPer100: 100,
      },
    ],
    invalid: [
      {
        name: '',
        category: 'Мясной',
        cookingNeed: 'Готовый к употреблению',
      },
      {
        name: 'Без категории',
        category: '',
        cookingNeed: 'Готовый к употреблению',
      },
      {
        name: 'Отрицательные калории',
        category: 'Овощи',
        cookingNeed: 'Готовый к употреблению',
        caloriesPer100: -1,
      },
    ],
  },
  dishes: {
    valid: [
      {
        name: 'Паста Болоньезе',
        category: 'Второе',
        calories: 350,
        proteins: 15,
        fats: 12,
        carbs: 48,
        size: 300,
      },
      {
        name: 'Овощной салат',
        category: 'Салат',
        calories: 150,
        proteins: 5,
        fats: 8,
        carbs: 12,
        size: 200,
        vegan: true,
      },
    ],
    boundary: [
      {
        name: '1000г',
        category: 'Первое',
        calories: 1000,
        proteins: 100,
        fats: 100,
        carbs: 100,
        size: 500,
      },
    ],
    invalid: [
      {
        name: '',
        category: 'Второе',
      },
      {
        name: 'Без категории',
        category: '',
      },
    ],
  },
});

type TestFixtures = {
  testData: TestData;
};

export const test = base.extend<TestFixtures>({
  testData: async ({}, use) => {
    await use(createTestData());
  },
});

export { expect };
