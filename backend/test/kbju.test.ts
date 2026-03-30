import { calculateDishKbjuOnPortion } from "../src/lib/kbju";

describe("calculateDishKbjuOnPortion", () => {
  let baseProduct: { caloriesPer100: number; proteinsPer100: number; fatsPer100: number; carbsPer100: number };

  beforeEach(() => {
    // Подготавливаем базовый продукт, чтобы переиспользовать в тестах
    baseProduct = { caloriesPer100: 200, proteinsPer100: 20, fatsPer100: 10, carbsPer100: 40 };
  });

  afterEach(() => {
    // Очистка окружения перед следующим тестом
    baseProduct = undefined as any;
  });

  it("Кейс 1: пустое блюдо -> 0 калорий, 0 белков, 0 жиров, 0 углеводов (эквивалентное разбиение)", () => {
    const result = calculateDishKbjuOnPortion({ items: [] });

    expect(result).toEqual({ calories: 0, proteins: 0, fats: 0, carbs: 0 });
  });

  it("Кейс 2: одиночный продукт 100г -> полные значения KBJU (граничное значение)", () => {
    const result = calculateDishKbjuOnPortion({ items: [{ product: baseProduct, quantityInGrams: 100 }] });
    expect(result).toEqual({ calories: 200, proteins: 20, fats: 10, carbs: 40 });
  });

  it.each([
    { quantity: 0, expectedRatio: 0 },
    { quantity: 1, expectedRatio: 0.01 },
    { quantity: 50, expectedRatio: 0.5 },
    { quantity: 100, expectedRatio: 1 },
  ])(
    "Кейс 3: параметризованное граничное тестирование quantity=$quantity г (0,1,50,100)",
    ({ quantity, expectedRatio }) => {
      const result = calculateDishKbjuOnPortion({ items: [{ product: baseProduct, quantityInGrams: quantity }] });
      expect(result.calories).toBeCloseTo(baseProduct.caloriesPer100 * expectedRatio);
      expect(result.proteins).toBeCloseTo(baseProduct.proteinsPer100 * expectedRatio);
      expect(result.fats).toBeCloseTo(baseProduct.fatsPer100 * expectedRatio);
      expect(result.carbs).toBeCloseTo(baseProduct.carbsPer100 * expectedRatio);
    },
  );

  it("Кейс 4: несколько продуктов в блюде суммируются (эквивалентное разбиение)", () => {
    const result = calculateDishKbjuOnPortion({
      items: [
        { product: baseProduct, quantityInGrams: 150 }, // 1.5 порции
        { product: { caloriesPer100: 100, proteinsPer100: 5, fatsPer100: 2, carbsPer100: 10 }, quantityInGrams: 75 }, // 0.75 порции
      ],
    });

    expect(result.calories).toBeCloseTo(200 * 1.5 + 100 * 0.75);
    expect(result.proteins).toBeCloseTo(20 * 1.5 + 5 * 0.75);
    expect(result.fats).toBeCloseTo(10 * 1.5 + 2 * 0.75);
    expect(result.carbs).toBeCloseTo(40 * 1.5 + 10 * 0.75);
  });

  it("Кейс 5: граничные значения 0г, 100г, 1000г (boundary analysis)", () => {
    const result = calculateDishKbjuOnPortion({
      items: [
        { product: baseProduct, quantityInGrams: 0 },
        { product: baseProduct, quantityInGrams: 100 },
        { product: baseProduct, quantityInGrams: 1000 },
      ],
    });

    expect(result.calories).toBeCloseTo(200 * (0 + 1 + 10));
    expect(result.proteins).toBeCloseTo(20 * (0 + 1 + 10));
    expect(result.fats).toBeCloseTo(10 * (0 + 1 + 10));
    expect(result.carbs).toBeCloseTo(40 * (0 + 1 + 10));
  });

  it("Кейс 6: отрицательное количество -100г принимает форму отрицательных KBJU (проверка неблагоприятного ввода)", () => {
    const result = calculateDishKbjuOnPortion({ items: [{ product: baseProduct, quantityInGrams: -100 }] });
    expect(result.calories).toBeCloseTo(-200);
    expect(result.proteins).toBeCloseTo(-20);
    expect(result.fats).toBeCloseTo(-10);
    expect(result.carbs).toBeCloseTo(-40);
  });
});

