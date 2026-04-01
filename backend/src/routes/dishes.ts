import { Router } from "express";
import { HttpError } from "../lib/httpError";
import { prisma } from "../lib/prisma";
import {
  DishCategoryEnumToRu,
  DishesQuerySchema,
  parseDishCategoryRuToEnum,
  CookingNeedEnumToRu,
  ProductCategoryEnumToRu,
  DishCreateInput,
  DishCreateSchema,
  DishUpdateInput,
  DishUpdateSchema,
} from "../lib/validation";
import { parseDishNameForFirstMacro } from "../lib/dishMacros";
import { calculateDishKbjuOnPortion } from "../lib/kbju";
import { applyRequestedFlagsToAllowed, computeDishAllowedFlags } from "../lib/dishFlags";

export const dishesRouter = Router();

dishesRouter.get("/", async (req, res, next) => {
  try {
    const parsed = DishesQuerySchema.parse(req.query);

    const where: any = {};
    // Не передаём поиск в БД, будем фильтровать на JS стороне
    if (parsed.category) {
      where.category = parseDishCategoryRuToEnum(parsed.category);
    }

    if (parsed.vegan) where.vegan = true;
    if (parsed.glutenFree) where.glutenFree = true;
    if (parsed.sugarFree) where.sugarFree = true;

    let items = await prisma.dish.findMany({ where });
    
    // Case-insensitive фильтрация по названию на JS стороне
    if (parsed.search) {
      const searchLower = parsed.search.toLowerCase();
      items = items.filter((d) => d.name.toLowerCase().includes(searchLower));
    }

    res.json({
      items: items.map((d) => ({
        id: d.id,
        name: d.name,
        photos: (d.photos ?? []) as string[],
        calories: d.calories,
        proteins: d.proteins,
        fats: d.fats,
        carbs: d.carbs,
        size: d.size,
        category: DishCategoryEnumToRu[d.category],
        vegan: d.vegan,
        glutenFree: d.glutenFree,
        sugarFree: d.sugarFree,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt ? d.updatedAt.toISOString() : null,
      })),
    });
  } catch (err) {
    next(err);
  }
});

dishesRouter.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      throw new HttpError({ status: 400, code: "BAD_REQUEST", message: "Invalid id" });
    }

    const dish = await prisma.dish.findUnique({
      where: { id },
      include: {
        dishProducts: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!dish) throw new HttpError({ status: 404, code: "NOT_FOUND", message: "Dish not found" });

    res.json({
      dish: {
        id: dish.id,
        name: dish.name,
        photos: (dish.photos ?? []) as string[],
        calories: dish.calories,
        proteins: dish.proteins,
        fats: dish.fats,
        carbs: dish.carbs,
        size: dish.size,
        category: DishCategoryEnumToRu[dish.category],
        vegan: dish.vegan,
        glutenFree: dish.glutenFree,
        sugarFree: dish.sugarFree,
        createdAt: dish.createdAt.toISOString(),
        updatedAt: dish.updatedAt ? dish.updatedAt.toISOString() : null,
        composition: dish.dishProducts.map((dp) => ({
          product: {
            id: dp.product.id,
            name: dp.product.name,
            caloriesPer100: dp.product.caloriesPer100,
            proteinsPer100: dp.product.proteinsPer100,
            fatsPer100: dp.product.fatsPer100,
            carbsPer100: dp.product.carbsPer100,
            category: ProductCategoryEnumToRu[dp.product.category],
            cookingNeed: CookingNeedEnumToRu[dp.product.cookingNeed],
            vegan: dp.product.vegan,
            glutenFree: dp.product.glutenFree,
            sugarFree: dp.product.sugarFree,
          },
          quantity: dp.quantity,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

async function loadProductsForDishComposition(productIds: number[]) {
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      caloriesPer100: true,
      proteinsPer100: true,
      fatsPer100: true,
      carbsPer100: true,
      vegan: true,
      glutenFree: true,
      sugarFree: true,
    },
  });
  return products;
}

dishesRouter.post("/", async (req, res, next) => {
  try {
    const input = DishCreateSchema.parse(req.body) as DishCreateInput;

    const { macroCategoryRu, sanitizedName } = parseDishNameForFirstMacro(input.name);

    const finalCategoryRu = input.category ?? macroCategoryRu;
    if (!finalCategoryRu) {
      throw new HttpError({
        status: 400,
        code: "CATEGORY_REQUIRED",
        message: "Dish category is required (either via field or macro in name).",
      });
    }

    const categoryEnum = parseDishCategoryRuToEnum(finalCategoryRu);

    const productIds = input.items.map((it) => it.productId);
    const unique = new Set(productIds);
    if (unique.size !== productIds.length) {
      throw new HttpError({
        status: 400,
        code: "DUPLICATE_PRODUCTS",
        message: "Composition must not contain duplicate productIds",
      });
    }

    const products = await loadProductsForDishComposition(productIds);
    if (products.length !== unique.size) {
      throw new HttpError({
        status: 400,
        code: "UNKNOWN_PRODUCT",
        message: "One or more products in composition do not exist",
      });
    }

    const productById = new Map(products.map((p) => [p.id, p]));
    const compositionForCalc = input.items.map((it) => ({
      product: {
        caloriesPer100: productById.get(it.productId)!.caloriesPer100,
        proteinsPer100: productById.get(it.productId)!.proteinsPer100,
        fatsPer100: productById.get(it.productId)!.fatsPer100,
        carbsPer100: productById.get(it.productId)!.carbsPer100,
      },
      quantityInGrams: it.quantity,
    }));

    const computed = calculateDishKbjuOnPortion({
      items: compositionForCalc.map((x) => ({
        product: x.product,
        quantityInGrams: x.quantityInGrams,
      })),
    });

    const allowed = computeDishAllowedFlags(
      products.map((p) => ({ vegan: p.vegan, glutenFree: p.glutenFree, sugarFree: p.sugarFree })),
    );

    const flags = applyRequestedFlagsToAllowed({
      allowed,
      requested: {
        vegan: input.vegan,
        glutenFree: input.glutenFree,
        sugarFree: input.sugarFree,
      },
    });

    const created = await prisma.dish.create({
      data: {
        name: sanitizedName,
        photos: input.photos,
        size: input.size,
        category: categoryEnum,
        vegan: flags.vegan,
        glutenFree: flags.glutenFree,
        sugarFree: flags.sugarFree,

        calories: input.calories ?? computed.calories,
        proteins: input.proteins ?? computed.proteins,
        fats: input.fats ?? computed.fats,
        carbs: input.carbs ?? computed.carbs,

        dishProducts: {
          create: input.items.map((it) => ({
            quantity: it.quantity,
            product: { connect: { id: it.productId } },
          })),
        },
      },
      include: {
        dishProducts: {
          include: { product: true },
        },
      },
    });

    res.status(201).json({
      dish: {
        id: created.id,
        name: created.name,
        photos: (created.photos ?? []) as string[],
        calories: created.calories,
        proteins: created.proteins,
        fats: created.fats,
        carbs: created.carbs,
        size: created.size,
        category: DishCategoryEnumToRu[created.category],
        vegan: created.vegan,
        glutenFree: created.glutenFree,
        sugarFree: created.sugarFree,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt ? created.updatedAt.toISOString() : null,
        composition: created.dishProducts.map((dp) => ({
          product: { id: dp.product.id, name: dp.product.name },
          quantity: dp.quantity,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

dishesRouter.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      throw new HttpError({ status: 400, code: "BAD_REQUEST", message: "Invalid id" });
    }

    const input = DishUpdateSchema.parse(req.body) as DishUpdateInput;

    const existing = await prisma.dish.findUnique({
      where: { id },
      include: { dishProducts: true },
    });
    if (!existing) throw new HttpError({ status: 404, code: "NOT_FOUND", message: "Dish not found" });

    const baseNameForMacro = input.name ?? existing.name;
    const { macroCategoryRu, sanitizedName } = parseDishNameForFirstMacro(baseNameForMacro);

    const finalCategoryRu = input.category ?? macroCategoryRu ?? DishCategoryEnumToRu[existing.category];
    const categoryEnum = parseDishCategoryRuToEnum(finalCategoryRu);

    const productIds = input.items.map((it) => it.productId);
    const unique = new Set(productIds);
    if (unique.size !== productIds.length) {
      throw new HttpError({
        status: 400,
        code: "DUPLICATE_PRODUCTS",
        message: "Composition must not contain duplicate productIds",
      });
    }

    const products = await loadProductsForDishComposition(productIds);
    if (products.length !== unique.size) {
      throw new HttpError({
        status: 400,
        code: "UNKNOWN_PRODUCT",
        message: "One or more products in composition do not exist",
      });
    }

    const productById = new Map(products.map((p) => [p.id, p]));
    const compositionForCalc = input.items.map((it) => ({
      product: {
        caloriesPer100: productById.get(it.productId)!.caloriesPer100,
        proteinsPer100: productById.get(it.productId)!.proteinsPer100,
        fatsPer100: productById.get(it.productId)!.fatsPer100,
        carbsPer100: productById.get(it.productId)!.carbsPer100,
      },
      quantityInGrams: it.quantity,
    }));

    const computed = calculateDishKbjuOnPortion({
      items: compositionForCalc.map((x) => ({
        product: x.product,
        quantityInGrams: x.quantityInGrams,
      })),
    });

    const allowed = computeDishAllowedFlags(
      products.map((p) => ({ vegan: p.vegan, glutenFree: p.glutenFree, sugarFree: p.sugarFree })),
    );

    const flags = applyRequestedFlagsToAllowed({
      allowed,
      requested: {
        vegan: input.vegan,
        glutenFree: input.glutenFree,
        sugarFree: input.sugarFree,
      },
    });

    const updated = await prisma.$transaction(async (tx) => {
      await tx.dishProduct.deleteMany({ where: { dishId: id } });

      return tx.dish.update({
        where: { id },
        data: {
          name: sanitizedName,
          photos: input.photos,
          size: input.size,
          category: categoryEnum,
          vegan: flags.vegan,
          glutenFree: flags.glutenFree,
          sugarFree: flags.sugarFree,
          calories: input.calories ?? computed.calories,
          proteins: input.proteins ?? computed.proteins,
          fats: input.fats ?? computed.fats,
          carbs: input.carbs ?? computed.carbs,
          dishProducts: {
            create: input.items.map((it) => ({
              quantity: it.quantity,
              product: { connect: { id: it.productId } },
            })),
          },
        },
        include: { dishProducts: { include: { product: true } } },
      });
    });

    res.json({
      dish: {
        id: updated.id,
        name: updated.name,
        photos: (updated.photos ?? []) as string[],
        calories: updated.calories,
        proteins: updated.proteins,
        fats: updated.fats,
        carbs: updated.carbs,
        size: updated.size,
        category: DishCategoryEnumToRu[updated.category],
        vegan: updated.vegan,
        glutenFree: updated.glutenFree,
        sugarFree: updated.sugarFree,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt ? updated.updatedAt.toISOString() : null,
        composition: updated.dishProducts.map((dp) => ({
          product: { id: dp.product.id, name: dp.product.name },
          quantity: dp.quantity,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

dishesRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      throw new HttpError({ status: 400, code: "BAD_REQUEST", message: "Invalid id" });
    }
    await prisma.dish.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

