"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDishKbjuOnPortion = calculateDishKbjuOnPortion;
function calculateDishKbjuOnPortion(params) {
    const { items } = params;
    let calories = 0;
    let proteins = 0;
    let fats = 0;
    let carbs = 0;
    for (const item of items) {
        const ratio = item.quantityInGrams / 100;
        calories += item.product.caloriesPer100 * ratio;
        proteins += item.product.proteinsPer100 * ratio;
        fats += item.product.fatsPer100 * ratio;
        carbs += item.product.carbsPer100 * ratio;
    }
    return {
        calories,
        proteins,
        fats,
        carbs,
    };
}
//# sourceMappingURL=kbju.js.map