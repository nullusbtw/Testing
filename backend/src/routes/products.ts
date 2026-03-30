import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";
import {
  CookingNeedEnumToRu,
  DishCategoryEnumToRu,
  ProductCategoryEnumToRu,
  ProductsQuerySchema,
  ProductCreateInput,
  ProductCreateSchema,
  ProductUpdateInput,
  ProductUpdateSchema,
  parseCookingNeedRuToEnum,
  parseProductCategoryRuToEnum,
} from "../lib/validation";

export const productsRouter = Router();

const ProductOutputSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  photos: z.array(z.string()),
  caloriesPer100: z.number(),
  proteinsPer100: z.number(),
  fatsPer100: z.number(),
  carbsPer100: z.number(),
  composition: z.string().nullable(),
  category: z.string(),
  cookingNeed: z.string(),
  vegan: z.boolean(),
  glutenFree: z.boolean(),
  sugarFree: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

productsRouter.get("/", async (req, res, next) => {
  try {
    const parsed = ProductsQuerySchema.parse(req.query);

    const where: any = {};
    if (parsed.search) {
      // Для SQLite (и текущей версии Prisma) параметр `mode` в строковых фильтрах `contains`
      // не поддерживается и приводит к runtime-ошибке 500.
      // Ожидаем, что поведение `contains` через `LIKE` и так достаточно для case-insensitive поиска.
      where.name = { contains: parsed.search };
    }
    if (parsed.category) {
      try {
        where.category = parseProductCategoryRuToEnum(parsed.category);
      } catch (e) {
        console.warn("Unknown category filter", parsed.category, e);
        // Не прерываем, чтобы поиск по другим параметрам работал.
      }
    }
    if (parsed.cookingNeed) {
      try {
        where.cookingNeed = parseCookingNeedRuToEnum(parsed.cookingNeed);
      } catch (e) {
        console.warn("Unknown cookingNeed filter", parsed.cookingNeed, e);
        // Не прерываем, чтобы поиск по другим параметрам работал.
      }
    }

    if (parsed.vegan) where.vegan = true;
    if (parsed.glutenFree) where.glutenFree = true;
    if (parsed.sugarFree) where.sugarFree = true;

    const dir = parsed.dir === "desc" ? "desc" : "asc";

    const orderBy: any =
      parsed.sort === "name"
        ? { name: dir }
        : parsed.sort === "calories"
          ? { caloriesPer100: dir }
          : parsed.sort === "proteins"
            ? { proteinsPer100: dir }
            : parsed.sort === "fats"
              ? { fatsPer100: dir }
              : { carbsPer100: dir };

    const items = await prisma.product.findMany({
      where,
      orderBy,
    });

    res.json({
      items: items.map((p) => ({
        id: p.id,
        name: p.name,
        photos: (p.photos ?? []) as string[],
        caloriesPer100: p.caloriesPer100,
        proteinsPer100: p.proteinsPer100,
        fatsPer100: p.fatsPer100,
        carbsPer100: p.carbsPer100,
        composition: p.composition ?? null,
        category: ProductCategoryEnumToRu[p.category],
        cookingNeed: CookingNeedEnumToRu[p.cookingNeed],
        vegan: p.vegan,
        glutenFree: p.glutenFree,
        sugarFree: p.sugarFree,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
      })),
    });
  } catch (err) {
    next(err);
  }
});

productsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new HttpError({ status: 400, code: "BAD_REQUEST", message: "Invalid id" });

    const p = await prisma.product.findUnique({ where: { id } });
    if (!p) throw new HttpError({ status: 404, code: "NOT_FOUND", message: "Product not found" });

    res.json({
      product: {
        id: p.id,
        name: p.name,
        photos: (p.photos ?? []) as string[],
        caloriesPer100: p.caloriesPer100,
        proteinsPer100: p.proteinsPer100,
        fatsPer100: p.fatsPer100,
        carbsPer100: p.carbsPer100,
        composition: p.composition ?? null,
        category: ProductCategoryEnumToRu[p.category],
        cookingNeed: CookingNeedEnumToRu[p.cookingNeed],
        vegan: p.vegan,
        glutenFree: p.glutenFree,
        sugarFree: p.sugarFree,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

productsRouter.post("/", async (req, res, next) => {
  try {
    const input = ProductCreateSchema.parse(req.body) as ProductCreateInput;

    const created = await prisma.product.create({
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
        photos: (created.photos ?? []) as string[],
        caloriesPer100: created.caloriesPer100,
        proteinsPer100: created.proteinsPer100,
        fatsPer100: created.fatsPer100,
        carbsPer100: created.carbsPer100,
        composition: created.composition ?? null,
        category: ProductCategoryEnumToRu[created.category],
        cookingNeed: CookingNeedEnumToRu[created.cookingNeed],
        vegan: created.vegan,
        glutenFree: created.glutenFree,
        sugarFree: created.sugarFree,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt ? created.updatedAt.toISOString() : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

productsRouter.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new HttpError({ status: 400, code: "BAD_REQUEST", message: "Invalid id" });

    const input = ProductUpdateSchema.parse(req.body) as ProductUpdateInput;

    const existing = await prisma.product.findUnique({
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
    if (!existing) throw new HttpError({ status: 404, code: "NOT_FOUND", message: "Product not found" });

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: input.name ?? existing.name,
        photos: (input.photos ?? existing.photos) as any,
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
  } catch (err) {
    next(err);
  }
});

productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new HttpError({ status: 400, code: "BAD_REQUEST", message: "Invalid id" });

    const used = await prisma.dishProduct.findMany({
      where: { productId: id },
      select: { dish: { select: { id: true, name: true } } },
    });

    if (used.length > 0) {
      throw new HttpError({
        status: 409,
        code: "PRODUCT_IN_USE",
        message: "Product is used in one or more dishes and cannot be deleted",
        details: {
          usedIn: used.map((u) => u.dish),
        },
      });
    }

    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

