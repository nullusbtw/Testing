"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kbju_1 = require("../src/lib/kbju");
describe("calculateDishKbjuOnPortion", () => {
    let baseProduct;
    beforeEach(() => {
        // Setup a reusable base product for test parametrization.
        baseProduct = { caloriesPer100: 200, proteinsPer100: 20, fatsPer100: 10, carbsPer100: 40 };
    });
    afterEach(() => {
        // Teardown if needed in future expansions (e.g., restoring mocks).
        baseProduct = undefined;
    });
    it("returns zero KBJU for empty dish (эквивалентное разбиение: пустой список)", () => {
        const result = (0, kbju_1.calculateDishKbjuOnPortion)({ items: [] });
        expect(result).toEqual({ calories: 0, proteins: 0, fats: 0, carbs: 0 });
    });
    it("correctly computes KBJU for single 100g product (граничное значение 100 г)", () => {
        const result = (0, kbju_1.calculateDishKbjuOnPortion)({ items: [{ product: baseProduct, quantityInGrams: 100 }] });
        expect(result).toEqual({ calories: 200, proteins: 20, fats: 10, carbs: 40 });
    });
    it.each([
        { quantity: 0, expectedRatio: 0 },
        { quantity: 1, expectedRatio: 0.01 },
        { quantity: 50, expectedRatio: 0.5 },
        { quantity: 100, expectedRatio: 1 },
    ])("parametrized boundary test quantity=$quantity g", ({ quantity, expectedRatio }) => {
        const result = (0, kbju_1.calculateDishKbjuOnPortion)({ items: [{ product: baseProduct, quantityInGrams: quantity }] });
        expect(result.calories).toBeCloseTo(baseProduct.caloriesPer100 * expectedRatio);
        expect(result.proteins).toBeCloseTo(baseProduct.proteinsPer100 * expectedRatio);
        expect(result.fats).toBeCloseTo(baseProduct.fatsPer100 * expectedRatio);
        expect(result.carbs).toBeCloseTo(baseProduct.carbsPer100 * expectedRatio);
    });
    it("handles multiple products cumulatively (эквивалентное разбиение: несколько записей)", () => {
        const result = (0, kbju_1.calculateDishKbjuOnPortion)({
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
    it("accepts 0 г, 100 г и 1000 г как граничные величины (boundary analysis)", () => {
        const result = (0, kbju_1.calculateDishKbjuOnPortion)({
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
    it("procedurally documents expected behavior с отрицательным количеством (проверка нестабильного ввода)", () => {
        const result = (0, kbju_1.calculateDishKbjuOnPortion)({ items: [{ product: baseProduct, quantityInGrams: -100 }] });
        expect(result.calories).toBeCloseTo(-200);
        expect(result.proteins).toBeCloseTo(-20);
        expect(result.fats).toBeCloseTo(-10);
        expect(result.carbs).toBeCloseTo(-40);
    });
});
//# sourceMappingURL=kbju.test.js.map