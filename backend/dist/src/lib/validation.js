"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DishesQuerySchema = exports.ProductsQuerySchema = exports.DishUpdateSchema = exports.DishCreateSchema = exports.DishBaseSchema = exports.DishCompositionItemSchema = exports.ProductUpdateSchema = exports.ProductCreateSchema = exports.DishCategoryEnumToRu = exports.CookingNeedEnumToRu = exports.ProductCategoryEnumToRu = exports.DishCategoryRuSchema = exports.CookingNeedRuSchema = exports.ProductCategoryRuSchema = void 0;
exports.parseProductCategoryRuToEnum = parseProductCategoryRuToEnum;
exports.parseCookingNeedRuToEnum = parseCookingNeedRuToEnum;
exports.parseDishCategoryRuToEnum = parseDishCategoryRuToEnum;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.ProductCategoryRuSchema = zod_1.z.enum([
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
exports.CookingNeedRuSchema = zod_1.z.enum([
    "Готовый к употреблению",
    "Полуфабрикат",
    "Требует приготовления",
]);
exports.DishCategoryRuSchema = zod_1.z.enum([
    "Десерт",
    "Первое",
    "Второе",
    "Напиток",
    "Салат",
    "Суп",
    "Перекус",
]);
const productCategoryRuToEnum = {
    "Замороженный": client_1.ProductCategory.Frozen,
    "Мясной": client_1.ProductCategory.Meat,
    "Овощи": client_1.ProductCategory.Vegetables,
    "Зелень": client_1.ProductCategory.Greens,
    "Специи": client_1.ProductCategory.Spices,
    "Крупы": client_1.ProductCategory.Grains,
    "Консервы": client_1.ProductCategory.Canned,
    "Жидкость": client_1.ProductCategory.Liquid,
    "Сладости": client_1.ProductCategory.Sweets,
};
const cookingNeedRuToEnum = {
    "Готовый к употреблению": client_1.CookingNeed.Ready,
    "Полуфабрикат": client_1.CookingNeed.SemiReady,
    "Требует приготовления": client_1.CookingNeed.RequiresCooking,
};
const dishCategoryRuToEnum = {
    "Десерт": client_1.DishCategory.Dessert,
    "Первое": client_1.DishCategory.First,
    "Второе": client_1.DishCategory.Second,
    "Напиток": client_1.DishCategory.Drink,
    "Салат": client_1.DishCategory.Salad,
    "Суп": client_1.DishCategory.Soup,
    "Перекус": client_1.DishCategory.Snack,
};
exports.ProductCategoryEnumToRu = {
    [client_1.ProductCategory.Frozen]: "Замороженный",
    [client_1.ProductCategory.Meat]: "Мясной",
    [client_1.ProductCategory.Vegetables]: "Овощи",
    [client_1.ProductCategory.Greens]: "Зелень",
    [client_1.ProductCategory.Spices]: "Специи",
    [client_1.ProductCategory.Grains]: "Крупы",
    [client_1.ProductCategory.Canned]: "Консервы",
    [client_1.ProductCategory.Liquid]: "Жидкость",
    [client_1.ProductCategory.Sweets]: "Сладости",
};
exports.CookingNeedEnumToRu = {
    [client_1.CookingNeed.Ready]: "Готовый к употреблению",
    [client_1.CookingNeed.SemiReady]: "Полуфабрикат",
    [client_1.CookingNeed.RequiresCooking]: "Требует приготовления",
};
exports.DishCategoryEnumToRu = {
    [client_1.DishCategory.Dessert]: "Десерт",
    [client_1.DishCategory.First]: "Первое",
    [client_1.DishCategory.Second]: "Второе",
    [client_1.DishCategory.Drink]: "Напиток",
    [client_1.DishCategory.Salad]: "Салат",
    [client_1.DishCategory.Soup]: "Суп",
    [client_1.DishCategory.Snack]: "Перекус",
};
const ProductBaseSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    photos: zod_1.z.array(zod_1.z.string().min(1)).max(5).optional().default([]),
    caloriesPer100: zod_1.z.number().min(0),
    proteinsPer100: zod_1.z.number().min(0).max(100),
    fatsPer100: zod_1.z.number().min(0).max(100),
    carbsPer100: zod_1.z.number().min(0).max(100),
    composition: zod_1.z.string().nullable().optional(),
    category: exports.ProductCategoryRuSchema.transform((v) => productCategoryRuToEnum[v]),
    cookingNeed: exports.CookingNeedRuSchema.transform((v) => cookingNeedRuToEnum[v]),
    vegan: zod_1.z.boolean().optional().default(false),
    glutenFree: zod_1.z.boolean().optional().default(false),
    sugarFree: zod_1.z.boolean().optional().default(false),
});
exports.ProductCreateSchema = ProductBaseSchema.refine((data) => {
    const sum = data.proteinsPer100 + data.fatsPer100 + data.carbsPer100;
    return sum <= 100;
}, {
    message: "Сумма белков, жиров и углеводов на 100 грамм не может превышать 100 грамм",
    path: ["proteinsPer100"],
});
exports.ProductUpdateSchema = ProductBaseSchema.partial().refine((data) => {
    // Проверяем сумму только если все три поля указаны
    if (data.proteinsPer100 !== undefined && data.fatsPer100 !== undefined && data.carbsPer100 !== undefined) {
        const sum = data.proteinsPer100 + data.fatsPer100 + data.carbsPer100;
        return sum <= 100;
    }
    return true;
}, {
    message: "Сумма белков, жиров и углеводов на 100 грамм не может превышать 100 грамм",
    path: ["proteinsPer100"],
});
const quantitySchema = zod_1.z.number().min(0.01);
exports.DishCompositionItemSchema = zod_1.z.object({
    productId: zod_1.z.number().int().positive(),
    quantity: quantitySchema,
});
exports.DishBaseSchema = zod_1.z.object({
    photos: zod_1.z.array(zod_1.z.string().min(1)).max(5).optional().default([]),
    size: zod_1.z.number().min(0.0001),
    items: zod_1.z.array(exports.DishCompositionItemSchema).min(1),
    // Важно: категория может быть опциональной, чтобы сервер мог вывести её из макросов в названии.
    category: exports.DishCategoryRuSchema.optional(),
    vegan: zod_1.z.boolean().optional().default(false),
    glutenFree: zod_1.z.boolean().optional().default(false),
    sugarFree: zod_1.z.boolean().optional().default(false),
    // Можно передать как “черновые значения”, сервер при необходимости их пересчитает.
    calories: zod_1.z.number().min(0).optional(),
    proteins: zod_1.z.number().min(0).max(100).optional(),
    fats: zod_1.z.number().min(0).max(100).optional(),
    carbs: zod_1.z.number().min(0).max(100).optional(),
});
exports.DishCreateSchema = exports.DishBaseSchema.extend({
    name: zod_1.z.string().min(2),
});
exports.DishUpdateSchema = exports.DishBaseSchema.extend({
    name: zod_1.z.string().min(2).optional(),
});
exports.ProductsQuerySchema = zod_1.z.object({
    category: exports.ProductCategoryRuSchema.optional(),
    cookingNeed: exports.CookingNeedRuSchema.optional(),
    vegan: zod_1.z.coerce.boolean().optional(),
    glutenFree: zod_1.z.coerce.boolean().optional(),
    sugarFree: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().optional(),
    sort: zod_1.z
        .enum(["name", "calories", "proteins", "fats", "carbs"])
        .optional()
        .default("name"),
    dir: zod_1.z.enum(["asc", "desc"]).optional().default("asc"),
});
exports.DishesQuerySchema = zod_1.z.object({
    category: exports.DishCategoryRuSchema.optional(),
    vegan: zod_1.z.coerce.boolean().optional(),
    glutenFree: zod_1.z.coerce.boolean().optional(),
    sugarFree: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().optional(),
});
function parseProductCategoryRuToEnum(value) {
    const mapped = productCategoryRuToEnum[value];
    if (!mapped)
        throw new Error(`Unknown product category: ${value}`);
    return mapped;
}
function parseCookingNeedRuToEnum(value) {
    const mapped = cookingNeedRuToEnum[value];
    if (!mapped)
        throw new Error(`Unknown cooking need: ${value}`);
    return mapped;
}
function parseDishCategoryRuToEnum(value) {
    const mapped = dishCategoryRuToEnum[value];
    if (!mapped)
        throw new Error(`Unknown dish category: ${value}`);
    return mapped;
}
//# sourceMappingURL=validation.js.map