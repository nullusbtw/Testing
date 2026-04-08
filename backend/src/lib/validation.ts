import { z } from "zod";
import type { CookingNeed, DishCategory, ProductCategory } from "@prisma/client";
import { ProductCategory as ProductCategoryEnum, CookingNeed as CookingNeedEnum, DishCategory as DishCategoryEnum } from "@prisma/client";

export const ProductCategoryRuSchema = z.enum([
  "Замороженный",
  "Мясной",
  "Овощи",
  "Зелень",
  "Специи",
  "Крупы",
  "Консервы",
  "Жидкость",
  "Сладости",
]);

export const CookingNeedRuSchema = z.enum([
  "Готовый к употреблению",
  "Полуфабрикат",
  "Требует приготовления",
]);

export const DishCategoryRuSchema = z.enum([
  "Десерт",
  "Первое",
  "Второе",
  "Напиток",
  "Салат",
  "Суп",
  "Перекус",
]);

const productCategoryRuToEnum = {
  "Замороженный": ProductCategoryEnum.Frozen,
  "Мясной": ProductCategoryEnum.Meat,
  "Овощи": ProductCategoryEnum.Vegetables,
  "Зелень": ProductCategoryEnum.Greens,
  "Специи": ProductCategoryEnum.Spices,
  "Крупы": ProductCategoryEnum.Grains,
  "Консервы": ProductCategoryEnum.Canned,
  "Жидкость": ProductCategoryEnum.Liquid,
  "Сладости": ProductCategoryEnum.Sweets,
} as const;

const cookingNeedRuToEnum = {
  "Готовый к употреблению": CookingNeedEnum.Ready,
  "Полуфабрикат": CookingNeedEnum.SemiReady,
  "Требует приготовления": CookingNeedEnum.RequiresCooking,
} as const;

const dishCategoryRuToEnum = {
  "Десерт": DishCategoryEnum.Dessert,
  "Первое": DishCategoryEnum.First,
  "Второе": DishCategoryEnum.Second,
  "Напиток": DishCategoryEnum.Drink,
  "Салат": DishCategoryEnum.Salad,
  "Суп": DishCategoryEnum.Soup,
  "Перекус": DishCategoryEnum.Snack,
} as const;

export const ProductCategoryEnumToRu: Record<ProductCategoryEnum, string> = {
  [ProductCategoryEnum.Frozen]: "Замороженный",
  [ProductCategoryEnum.Meat]: "Мясной",
  [ProductCategoryEnum.Vegetables]: "Овощи",
  [ProductCategoryEnum.Greens]: "Зелень",
  [ProductCategoryEnum.Spices]: "Специи",
  [ProductCategoryEnum.Grains]: "Крупы",
  [ProductCategoryEnum.Canned]: "Консервы",
  [ProductCategoryEnum.Liquid]: "Жидкость",
  [ProductCategoryEnum.Sweets]: "Сладости",
};

export const CookingNeedEnumToRu: Record<CookingNeedEnum, string> = {
  [CookingNeedEnum.Ready]: "Готовый к употреблению",
  [CookingNeedEnum.SemiReady]: "Полуфабрикат",
  [CookingNeedEnum.RequiresCooking]: "Требует приготовления",
};

export const DishCategoryEnumToRu: Record<DishCategoryEnum, string> = {
  [DishCategoryEnum.Dessert]: "Десерт",
  [DishCategoryEnum.First]: "Первое",
  [DishCategoryEnum.Second]: "Второе",
  [DishCategoryEnum.Drink]: "Напиток",
  [DishCategoryEnum.Salad]: "Салат",
  [DishCategoryEnum.Soup]: "Суп",
  [DishCategoryEnum.Snack]: "Перекус",
};

const ProductBaseSchema = z.object({
  name: z.string().min(2),
  photos: z.array(z.string().min(1)).max(5).optional().default([]),
  caloriesPer100: z.number().min(0),
  proteinsPer100: z.number().min(0).max(100),
  fatsPer100: z.number().min(0).max(100),
  carbsPer100: z.number().min(0).max(100),
  composition: z.string().nullable().optional(),
  category: ProductCategoryRuSchema.transform((v) => productCategoryRuToEnum[v]),
  cookingNeed: CookingNeedRuSchema.transform((v) => cookingNeedRuToEnum[v]),

  vegan: z.boolean().optional().default(false),
  glutenFree: z.boolean().optional().default(false),
  sugarFree: z.boolean().optional().default(false),
});

export const ProductCreateSchema = ProductBaseSchema;

export const ProductUpdateSchema = ProductBaseSchema.partial();

export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;

const quantitySchema = z.number().min(0.01);

export const DishCompositionItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: quantitySchema,
});

export const DishBaseSchema = z.object({
  photos: z.array(z.string().min(1)).max(5).optional().default([]),

  size: z.number().min(0.0001),
  items: z.array(DishCompositionItemSchema).min(1),

  // Важно: категория может быть опциональной, чтобы сервер мог вывести её из макросов в названии.
  category: DishCategoryRuSchema.optional(),

  vegan: z.boolean().optional().default(false),
  glutenFree: z.boolean().optional().default(false),
  sugarFree: z.boolean().optional().default(false),

  // Можно передать как “черновые значения”, сервер при необходимости их пересчитает.
  calories: z.number().min(0).optional(),
  proteins: z.number().min(0).max(100).optional(),
  fats: z.number().min(0).max(100).optional(),
  carbs: z.number().min(0).max(100).optional(),
});

export const DishCreateSchema = DishBaseSchema.extend({
  name: z.string().min(2),
});

export const DishUpdateSchema = DishBaseSchema.extend({
  name: z.string().min(2).optional(),
});

export type DishCreateInput = z.infer<typeof DishCreateSchema>;
export type DishUpdateInput = z.infer<typeof DishUpdateSchema>;

export const ProductsQuerySchema = z.object({
  category: ProductCategoryRuSchema.optional(),
  cookingNeed: CookingNeedRuSchema.optional(),
  vegan: z.coerce.boolean().optional(),
  glutenFree: z.coerce.boolean().optional(),
  sugarFree: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sort: z
    .enum(["name", "calories", "proteins", "fats", "carbs"])
    .optional()
    .default("name"),
  dir: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const DishesQuerySchema = z.object({
  category: DishCategoryRuSchema.optional(),
  vegan: z.coerce.boolean().optional(),
  glutenFree: z.coerce.boolean().optional(),
  sugarFree: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export function parseProductCategoryRuToEnum(value: string): ProductCategoryEnum {
  const mapped = (productCategoryRuToEnum as Record<string, ProductCategoryEnum>)[value];
  if (!mapped) throw new Error(`Unknown product category: ${value}`);
  return mapped;
}

export function parseCookingNeedRuToEnum(value: string): CookingNeedEnum {
  const mapped = (cookingNeedRuToEnum as Record<string, CookingNeedEnum>)[value];
  if (!mapped) throw new Error(`Unknown cooking need: ${value}`);
  return mapped;
}

export function parseDishCategoryRuToEnum(value: string): DishCategoryEnum {
  const mapped = (dishCategoryRuToEnum as Record<string, DishCategoryEnum>)[value];
  if (!mapped) throw new Error(`Unknown dish category: ${value}`);
  return mapped;
}

