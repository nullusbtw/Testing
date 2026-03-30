"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kbju_1 = require("../src/lib/kbju");
describe("calculateDishKbjuOnPortion", () => {
    it("computes totals from 100g metrics", () => {
        const result = (0, kbju_1.calculateDishKbjuOnPortion)({
            items: [
                { product: { caloriesPer100: 100, proteinsPer100: 10, fatsPer100: 5, carbsPer100: 20 }, quantityInGrams: 50 },
                { product: { caloriesPer100: 200, proteinsPer100: 20, fatsPer100: 10, carbsPer100: 40 }, quantityInGrams: 25 },
            ],
        });
        // 50g => 0.5 portion of first product, 25g => 0.25 portion of second product
        expect(result.calories).toBeCloseTo(100 * 0.5 + 200 * 0.25);
        expect(result.proteins).toBeCloseTo(10 * 0.5 + 20 * 0.25);
        expect(result.fats).toBeCloseTo(5 * 0.5 + 10 * 0.25);
        expect(result.carbs).toBeCloseTo(20 * 0.5 + 40 * 0.25);
    });
});
//# sourceMappingURL=kbju.test.js.map