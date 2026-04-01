"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const httpError_1 = require("../lib/httpError");
const validation_1 = require("../lib/validation");
exports.productsRouter = (0, express_1.Router)();
const ProductOutputSchema = zod_1.z.object({
    id: zod_1.z.number().int(),
    name: zod_1.z.string(),
    photos: zod_1.z.array(zod_1.z.string()),
    caloriesPer100: zod_1.z.number(),
    proteinsPer100: zod_1.z.number(),
    fatsPer100: zod_1.z.number(),
    carbsPer100: zod_1.z.number(),
    composition: zod_1.z.string().nullable(),
    category: zod_1.z.string(),
    cookingNeed: zod_1.z.string(),
    vegan: zod_1.z.boolean(),
    glutenFree: zod_1.z.boolean(),
    sugarFree: zod_1.z.boolean(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string().nullable(),
});
exports.productsRouter.get("/", async (req, res, next) => {
    try {
        const parsed = validation_1.ProductsQuerySchema.parse(req.query);
        const where = {};
        // Не передаём поиск в БД, будем фильтровать на JS стороне
        if (parsed.category) {
            try {
                where.category = (0, validation_1.parseProductCategoryRuToEnum)(parsed.category);
            }
            catch (e) {
                console.warn("Unknown category filter", parsed.category, e);
                // Не прерываем, чтобы поиск по другим параметрам работал.
            }
        }
        if (parsed.cookingNeed) {
            try {
                where.cookingNeed = (0, validation_1.parseCookingNeedRuToEnum)(parsed.cookingNeed);
            }
            catch (e) {
                console.warn("Unknown cookingNeed filter", parsed.cookingNeed, e);
                // Не прерываем, чтобы поиск по другим параметрам работал.
            }
        }
        if (parsed.vegan)
            where.vegan = true;
        if (parsed.glutenFree)
            where.glutenFree = true;
        if (parsed.sugarFree)
            where.sugarFree = true;
        const dir = parsed.dir === "desc" ? "desc" : "asc";
        const orderBy = parsed.sort === "name"
            ? { name: dir }
            : parsed.sort === "calories"
                ? { caloriesPer100: dir }
                : parsed.sort === "proteins"
                    ? { proteinsPer100: dir }
                    : parsed.sort === "fats"
                        ? { fatsPer100: dir }
                        : { carbsPer100: dir };
        let items = await prisma_1.prisma.product.findMany({
            where,
            orderBy,
        });
        // Case-insensitive фильтрация по названию на JS стороне
        if (parsed.search) {
            const searchLower = parsed.search.toLowerCase();
            items = items.filter((p) => p.name.toLowerCase().includes(searchLower));
        }
        res.json({
            items: items.map((p) => ({
                id: p.id,
                name: p.name,
                photos: (p.photos ?? []),
                caloriesPer100: p.caloriesPer100,
                proteinsPer100: p.proteinsPer100,
                fatsPer100: p.fatsPer100,
                carbsPer100: p.carbsPer100,
                composition: p.composition ?? null,
                category: validation_1.ProductCategoryEnumToRu[p.category],
                cookingNeed: validation_1.CookingNeedEnumToRu[p.cookingNeed],
                vegan: p.vegan,
                glutenFree: p.glutenFree,
                sugarFree: p.sugarFree,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
            })),
        });
    }
    catch (err) {
        next(err);
    }
});
exports.productsRouter.get("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id))
            throw new httpError_1.HttpError({ status: 400, code: "BAD_REQUEST", message: "Invalid id" });
        const p = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!p)
            throw new httpError_1.HttpError({ status: 404, code: "NOT_FOUND", message: "Product not found" });
        res.json({
            product: {
                id: p.id,
                name: p.name,
                photos: (p.photos ?? []),
                caloriesPer100: p.caloriesPer100,
                proteinsPer100: p.proteinsPer100,
                fatsPer100: p.fatsPer100,
                carbsPer100: p.carbsPer100,
                composition: p.composition ?? null,
                category: validation_1.ProductCategoryEnumToRu[p.category],
                cookingNeed: validation_1.CookingNeedEnumToRu[p.cookingNeed],
                vegan: p.vegan,
                glutenFree: p.glutenFree,
                sugarFree: p.sugarFree,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.productsRouter.post("/", async (req, res, next) => {
    try {
        const input = validation_1.ProductCreateSchema.parse(req.body);
        const created = await prisma_1.prisma.product.create({
            data: {
                name: input.name,
                photos: input.photos,
                caloriesPer100: input.caloriesPer100,
                proteinsPer100: input.proteinsPer100,
                fatsPer100: input.fatsPer100,
                carbsPer100: input.carbsPer100,
                composition: input.composition ?? null,
                category: input.category,
                cookingNeed: input.cookingNeed,
                vegan: input.vegan,
                glutenFree: input.glutenFree,
                sugarFree: input.sugarFree,
            },
        });
        res.status(201).json({
            product: {
                id: created.id,
                name: created.name,
                photos: (created.photos ?? []),
                caloriesPer100: created.caloriesPer100,
                proteinsPer100: created.proteinsPer100,
                fatsPer100: created.fatsPer100,
                carbsPer100: created.carbsPer100,
                composition: created.composition ?? null,
                category: validation_1.ProductCategoryEnumToRu[created.category],
                cookingNeed: validation_1.CookingNeedEnumToRu[created.cookingNeed],
                vegan: created.vegan,
                glutenFree: created.glutenFree,
                sugarFree: created.sugarFree,
                createdAt: created.createdAt.toISOString(),
                updatedAt: created.updatedAt ? created.updatedAt.toISOString() : null,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.productsRouter.put("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id))
            throw new httpError_1.HttpError({ status: 400, code: "BAD_REQUEST", message: "Invalid id" });
        const input = validation_1.ProductUpdateSchema.parse(req.body);
        const existing = await prisma_1.prisma.product.findUnique({
            where: { id },
            select: {
                name: true,
                photos: true,
                caloriesPer100: true,
                proteinsPer100: true,
                fatsPer100: true,
                carbsPer100: true,
                composition: true,
                category: true,
                cookingNeed: true,
                vegan: true,
                glutenFree: true,
                sugarFree: true,
            },
        });
        if (!existing)
            throw new httpError_1.HttpError({ status: 404, code: "NOT_FOUND", message: "Product not found" });
        const updated = await prisma_1.prisma.product.update({
            where: { id },
            data: {
                name: input.name ?? existing.name,
                photos: (input.photos ?? existing.photos),
                caloriesPer100: input.caloriesPer100 ?? existing.caloriesPer100,
                proteinsPer100: input.proteinsPer100 ?? existing.proteinsPer100,
                fatsPer100: input.fatsPer100 ?? existing.fatsPer100,
                carbsPer100: input.carbsPer100 ?? existing.carbsPer100,
                composition: input.composition === undefined ? existing.composition : input.composition,
                category: input.category ?? existing.category,
                cookingNeed: input.cookingNeed ?? existing.cookingNeed,
                vegan: input.vegan ?? existing.vegan,
                glutenFree: input.glutenFree ?? existing.glutenFree,
                sugarFree: input.sugarFree ?? existing.sugarFree,
            },
        });
        res.json({ product: updated });
    }
    catch (err) {
        next(err);
    }
});
exports.productsRouter.delete("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id))
            throw new httpError_1.HttpError({ status: 400, code: "BAD_REQUEST", message: "Invalid id" });
        const used = await prisma_1.prisma.dishProduct.findMany({
            where: { productId: id },
            select: { dish: { select: { id: true, name: true } } },
        });
        if (used.length > 0) {
            throw new httpError_1.HttpError({
                status: 409,
                code: "PRODUCT_IN_USE",
                message: "Product is used in one or more dishes and cannot be deleted",
                details: {
                    usedIn: used.map((u) => u.dish),
                },
            });
        }
        await prisma_1.prisma.product.delete({ where: { id } });
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=products.js.map