export type Kbju100 = {
    caloriesPer100: number;
    proteinsPer100: number;
    fatsPer100: number;
    carbsPer100: number;
};
export declare function calculateDishKbjuOnPortion(params: {
    items: Array<{
        product: Kbju100;
        quantityInGrams: number;
    }>;
}): {
    calories: number;
    proteins: number;
    fats: number;
    carbs: number;
};
//# sourceMappingURL=kbju.d.ts.map