"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const prisma_1 = require("../src/lib/prisma");
const app = (0, app_1.createApp)();
async function cleanupDb() {
    await prisma_1.prisma.dishProduct.deleteMany();
    await prisma_1.prisma.dish.deleteMany();
    await prisma_1.prisma.product.deleteMany();
}
describe("API - Dish CRUD Operations", () => {
    let product1;
    let product2;
    beforeAll(async () => {
        await cleanupDb();
        const res1 = await (0, supertest_1.default)(app).post("/api/products").send({
            name: "Рис",
            photos: [],
            caloriesPer100: 130,
            proteinsPer100: 2.7,
            fatsPer100: 0.3,
            carbsPer100: 28,
            composition: null,
            category: "Крупы",
            cookingNeed: "Требует приготовления",
            vegan: true,
            glutenFree: true,
            sugarFree: true,
        });
        product1 = { id: res1.body.product.id };
        const res2 = await (0, supertest_1.default)(app).post("/api/products").send({
            name: "Яйцо",
            photos: [],
            caloriesPer100: 155,
            proteinsPer100: 13,
            fatsPer100: 11,
            carbsPer100: 1.1,
            composition: null,
            category: "Замороженный",
            cookingNeed: "Требует приготовления",
            vegan: false,
            glutenFree: true,
            sugarFree: true,
        });
        product2 = { id: res2.body.product.id };
    });
    afterAll(async () => {
        await cleanupDb();
    });
    beforeEach(async () => {
        await prisma_1.prisma.dishProduct.deleteMany();
        await prisma_1.prisma.dish.deleteMany();
    });
    // GET: Чтение блюд
    describe("GET Operations", () => {
        it("Успешное получение блюда по ID", async () => {
            const createRes = await (0, supertest_1.default)(app).post("/api/dishes").send({
                name: "!второе Плов",
                photos: [],
                size: 200,
                items: [{ productId: product1.id, quantity: 100 }],
            });
            const dishId = createRes.body.dish.id;
            const res = await (0, supertest_1.default)(app).get(`/api/dishes/${dishId}`);
            expect(res.status).toBe(200);
            expect(res.body.dish.id).toBe(dishId);
            expect(res.body.dish.name).toBe("Плов");
        });
        it("Ошибка при получении несуществующего блюда (граница: non-existent ID)", async () => {
            const res = await (0, supertest_1.default)(app).get("/api/dishes/99999");
            expect(res.status).toBe(404);
            expect(res.body.error.code).toBe("NOT_FOUND");
        });
    });
    // POST: Создание блюда
    describe("POST Operations", () => {
        it("Успешное создание блюда с расчётом KBJU", async () => {
            const res = await (0, supertest_1.default)(app).post("/api/dishes").send({
                name: "!второе Рис с яйцом",
                photos: [],
                size: 200,
                items: [
                    { productId: product1.id, quantity: 100 },
                    { productId: product2.id, quantity: 50 },
                ],
            });
            expect(res.status).toBe(201);
            expect(res.body.dish.name).toBe("Рис с яйцом");
            expect(res.body.dish.category).toBe("Второе");
            expect(res.body.dish.calories).toBeGreaterThan(0);
        });
        it("Ошибка при дублирующихся продуктах в составе", async () => {
            const res = await (0, supertest_1.default)(app).post("/api/dishes").send({
                name: "Блюдо",
                photos: [],
                size: 100,
                category: "Второе",
                items: [
                    { productId: product1.id, quantity: 50 },
                    { productId: product1.id, quantity: 50 },
                ],
            });
            expect(res.status).toBe(400);
            expect(res.body.error.code).toBe("DUPLICATE_PRODUCTS");
        });
    });
    // PUT: Обновление блюда
    describe("PUT Operations", () => {
        it("Успешное обновление имени блюда", async () => {
            const createRes = await (0, supertest_1.default)(app).post("/api/dishes").send({
                name: "Рис",
                photos: [],
                size: 150,
                category: "Второе",
                items: [{ productId: product1.id, quantity: 100 }],
            });
            const dishId = createRes.body.dish.id;
            const res = await (0, supertest_1.default)(app).put(`/api/dishes/${dishId}`).send({
                name: "Рис на гарнир",
                size: 150,
                items: [{ productId: product1.id, quantity: 100 }],
            });
            expect(res.status).toBe(200);
            expect(res.body.dish.name).toBe("Рис на гарнир");
        });
        it("Ошибка при обновлении несуществующего блюда", async () => {
            const res = await (0, supertest_1.default)(app).put("/api/dishes/99999").send({
                name: "Новое имя",
                size: 150,
                items: [{ productId: product1.id, quantity: 100 }],
            });
            expect(res.status).toBe(404);
            expect(res.body.error.code).toBe("NOT_FOUND");
        });
    });
    // DELETE: Удаление блюда
    describe("DELETE Operations", () => {
        it("Успешное удаление блюда", async () => {
            const createRes = await (0, supertest_1.default)(app).post("/api/dishes").send({
                name: "Блюдо для удаления",
                photos: [],
                size: 100,
                category: "Второе",
                items: [{ productId: product1.id, quantity: 50 }],
            });
            const dishId = createRes.body.dish.id;
            const deleteRes = await (0, supertest_1.default)(app).delete(`/api/dishes/${dishId}`);
            expect(deleteRes.status).toBe(204);
            const getRes = await (0, supertest_1.default)(app).get(`/api/dishes/${dishId}`);
            expect(getRes.status).toBe(404);
        });
        it("Ошибка при удалении несуществующего блюда", async () => {
            const res = await (0, supertest_1.default)(app).delete("/api/dishes/99999");
            expect(res.status).toBe(404);
        });
    });
});
//# sourceMappingURL=api.dishCrud.test.js.map