export type Kbju100 = {
  caloriesPer100: number;
  proteinsPer100: number;
  fatsPer100: number;
  carbsPer100: number;
};

export function calculateDishKbjuOnPortion(params: {
  items: Array<{ product: Kbju100; quantityInGrams: number }>;
}) {
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

