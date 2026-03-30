import { z } from "zod";
import { ProductCategory as ProductCategoryEnum, CookingNeed as CookingNeedEnum, DishCategory as DishCategoryEnum } from "@prisma/client";
export declare const ProductCategoryRuSchema: z.ZodEnum<{
    Замороженный: "Замороженный";
    Мясной: "Мясной";
    Овощи: "Овощи";
    Зелень: "Зелень";
    Специи: "Специи";
    Крупы: "Крупы";
    Консервы: "Консервы";
    Жидкость: "Жидкость";
    Сладости: "Сладости";
}>;
export declare const CookingNeedRuSchema: z.ZodEnum<{
    "\u0413\u043E\u0442\u043E\u0432\u044B\u0439 \u043A \u0443\u043F\u043E\u0442\u0440\u0435\u0431\u043B\u0435\u043D\u0438\u044E": "Готовый к употреблению";
    Полуфабрикат: "Полуфабрикат";
    "\u0422\u0440\u0435\u0431\u0443\u0435\u0442 \u043F\u0440\u0438\u0433\u043E\u0442\u043E\u0432\u043B\u0435\u043D\u0438\u044F": "Требует приготовления";
}>;
export declare const DishCategoryRuSchema: z.ZodEnum<{
    Десерт: "Десерт";
    Первое: "Первое";
    Второе: "Второе";
    Напиток: "Напиток";
    Салат: "Салат";
    Суп: "Суп";
    Перекус: "Перекус";
}>;
export declare const ProductCategoryEnumToRu: Record<ProductCategoryEnum, string>;
export declare const CookingNeedEnumToRu: Record<CookingNeedEnum, string>;
export declare const DishCategoryEnumToRu: Record<DishCategoryEnum, string>;
export declare const ProductCreateSchema: z.ZodObject<{
    name: z.ZodString;
    photos: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    caloriesPer100: z.ZodNumber;
    proteinsPer100: z.ZodNumber;
    fatsPer100: z.ZodNumber;
    carbsPer100: z.ZodNumber;
    composition: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    category: z.ZodPipe<z.ZodEnum<{
        Замороженный: "Замороженный";
        Мясной: "Мясной";
        Овощи: "Овощи";
        Зелень: "Зелень";
        Специи: "Специи";
        Крупы: "Крупы";
        Консервы: "Консервы";
        Жидкость: "Жидкость";
        Сладости: "Сладости";
    }>, z.ZodTransform<"Frozen" | "Meat" | "Vegetables" | "Greens" | "Spices" | "Grains" | "Canned" | "Liquid" | "Sweets", "Замороженный" | "Мясной" | "Овощи" | "Зелень" | "Специи" | "Крупы" | "Консервы" | "Жидкость" | "Сладости">>;
    cookingNeed: z.ZodPipe<z.ZodEnum<{
        "\u0413\u043E\u0442\u043E\u0432\u044B\u0439 \u043A \u0443\u043F\u043E\u0442\u0440\u0435\u0431\u043B\u0435\u043D\u0438\u044E": "Готовый к употреблению";
        Полуфабрикат: "Полуфабрикат";
        "\u0422\u0440\u0435\u0431\u0443\u0435\u0442 \u043F\u0440\u0438\u0433\u043E\u0442\u043E\u0432\u043B\u0435\u043D\u0438\u044F": "Требует приготовления";
    }>, z.ZodTransform<"Ready" | "SemiReady" | "RequiresCooking", "Готовый к употреблению" | "Полуфабрикат" | "Требует приготовления">>;
    vegan: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    glutenFree: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    sugarFree: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const ProductUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    photos: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>>;
    caloriesPer100: z.ZodOptional<z.ZodNumber>;
    proteinsPer100: z.ZodOptional<z.ZodNumber>;
    fatsPer100: z.ZodOptional<z.ZodNumber>;
    carbsPer100: z.ZodOptional<z.ZodNumber>;
    composition: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    category: z.ZodOptional<z.ZodPipe<z.ZodEnum<{
        Замороженный: "Замороженный";
        Мясной: "Мясной";
        Овощи: "Овощи";
        Зелень: "Зелень";
        Специи: "Специи";
        Крупы: "Крупы";
        Консервы: "Консервы";
        Жидкость: "Жидкость";
        Сладости: "Сладости";
    }>, z.ZodTransform<"Frozen" | "Meat" | "Vegetables" | "Greens" | "Spices" | "Grains" | "Canned" | "Liquid" | "Sweets", "Замороженный" | "Мясной" | "Овощи" | "Зелень" | "Специи" | "Крупы" | "Консервы" | "Жидкость" | "Сладости">>>;
    cookingNeed: z.ZodOptional<z.ZodPipe<z.ZodEnum<{
        "\u0413\u043E\u0442\u043E\u0432\u044B\u0439 \u043A \u0443\u043F\u043E\u0442\u0440\u0435\u0431\u043B\u0435\u043D\u0438\u044E": "Готовый к употреблению";
        Полуфабрикат: "Полуфабрикат";
        "\u0422\u0440\u0435\u0431\u0443\u0435\u0442 \u043F\u0440\u0438\u0433\u043E\u0442\u043E\u0432\u043B\u0435\u043D\u0438\u044F": "Требует приготовления";
    }>, z.ZodTransform<"Ready" | "SemiReady" | "RequiresCooking", "Готовый к употреблению" | "Полуфабрикат" | "Требует приготовления">>>;
    vegan: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
    glutenFree: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
    sugarFree: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
}, z.core.$strip>;
export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
export declare const DishCompositionItemSchema: z.ZodObject<{
    productId: z.ZodNumber;
    quantity: z.ZodNumber;
}, z.core.$strip>;
export declare const DishBaseSchema: z.ZodObject<{
    photos: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    size: z.ZodNumber;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodNumber;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
    category: z.ZodOptional<z.ZodEnum<{
        Десерт: "Десерт";
        Первое: "Первое";
        Второе: "Второе";
        Напиток: "Напиток";
        Салат: "Салат";
        Суп: "Суп";
        Перекус: "Перекус";
    }>>;
    vegan: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    glutenFree: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    sugarFree: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    calories: z.ZodOptional<z.ZodNumber>;
    proteins: z.ZodOptional<z.ZodNumber>;
    fats: z.ZodOptional<z.ZodNumber>;
    carbs: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const DishCreateSchema: z.ZodObject<{
    photos: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    size: z.ZodNumber;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodNumber;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
    category: z.ZodOptional<z.ZodEnum<{
        Десерт: "Десерт";
        Первое: "Первое";
        Второе: "Второе";
        Напиток: "Напиток";
        Салат: "Салат";
        Суп: "Суп";
        Перекус: "Перекус";
    }>>;
    vegan: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    glutenFree: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    sugarFree: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    calories: z.ZodOptional<z.ZodNumber>;
    proteins: z.ZodOptional<z.ZodNumber>;
    fats: z.ZodOptional<z.ZodNumber>;
    carbs: z.ZodOptional<z.ZodNumber>;
    name: z.ZodString;
}, z.core.$strip>;
export declare const DishUpdateSchema: z.ZodObject<{
    photos: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    size: z.ZodNumber;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodNumber;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
    category: z.ZodOptional<z.ZodEnum<{
        Десерт: "Десерт";
        Первое: "Первое";
        Второе: "Второе";
        Напиток: "Напиток";
        Салат: "Салат";
        Суп: "Суп";
        Перекус: "Перекус";
    }>>;
    vegan: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    glutenFree: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    sugarFree: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    calories: z.ZodOptional<z.ZodNumber>;
    proteins: z.ZodOptional<z.ZodNumber>;
    fats: z.ZodOptional<z.ZodNumber>;
    carbs: z.ZodOptional<z.ZodNumber>;
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type DishCreateInput = z.infer<typeof DishCreateSchema>;
export type DishUpdateInput = z.infer<typeof DishUpdateSchema>;
export declare const ProductsQuerySchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodEnum<{
        Замороженный: "Замороженный";
        Мясной: "Мясной";
        Овощи: "Овощи";
        Зелень: "Зелень";
        Специи: "Специи";
        Крупы: "Крупы";
        Консервы: "Консервы";
        Жидкость: "Жидкость";
        Сладости: "Сладости";
    }>>;
    cookingNeed: z.ZodOptional<z.ZodEnum<{
        "\u0413\u043E\u0442\u043E\u0432\u044B\u0439 \u043A \u0443\u043F\u043E\u0442\u0440\u0435\u0431\u043B\u0435\u043D\u0438\u044E": "Готовый к употреблению";
        Полуфабрикат: "Полуфабрикат";
        "\u0422\u0440\u0435\u0431\u0443\u0435\u0442 \u043F\u0440\u0438\u0433\u043E\u0442\u043E\u0432\u043B\u0435\u043D\u0438\u044F": "Требует приготовления";
    }>>;
    vegan: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    glutenFree: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    sugarFree: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    sort: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        name: "name";
        calories: "calories";
        proteins: "proteins";
        fats: "fats";
        carbs: "carbs";
    }>>>;
    dir: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>>;
}, z.core.$strip>;
export declare const DishesQuerySchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodEnum<{
        Десерт: "Десерт";
        Первое: "Первое";
        Второе: "Второе";
        Напиток: "Напиток";
        Салат: "Салат";
        Суп: "Суп";
        Перекус: "Перекус";
    }>>;
    vegan: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    glutenFree: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    sugarFree: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare function parseProductCategoryRuToEnum(value: string): ProductCategoryEnum;
export declare function parseCookingNeedRuToEnum(value: string): CookingNeedEnum;
export declare function parseDishCategoryRuToEnum(value: string): DishCategoryEnum;
//# sourceMappingURL=validation.d.ts.map