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
describe("API - Расчёт КБЖУ блюда", () => {
    let product1;
    let product2;
    beforeAll(async () => {
        await cleanupDb();
        const res1 = await (0, supertest_1.default)(app).post("/api/products").send({
            name: "Овсянка",
            photos: [],
            caloriesPer100: 350,
            proteinsPer100: 12,
            fatsPer100: 6,
            carbsPer100: 60,
            composition: null,
            category: "Крупы",
            cookingNeed: "Готовый к употреблению",
            vegan: true,
            glutenFree: false,
            sugarFree: true,
        });
        product1 = { id: res1.body.product.id };
        const res2 = await (0, supertest_1.default)(app).post("/api/products").send({
            name: "Молоко",
            photos: [],
            caloriesPer100: 60,
            proteinsPer100: 3,
            fatsPer100: 3.5,
            carbsPer100: 4.5,
            composition: null,
            category: "Жидкость",
            cookingNeed: "Готовый к употреблению",
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
    // Эквивалентное разбиение. Тесты: положительное, ноль, отрицательное
    describe("Эквивалентное разбиение для количества", () => {
        it("должен рассчитывать КБЖУ для положительного количества (класс: положительный)", async () => {
            const res = await (0, supertest_1.default)(app).post("/api/dishes").send({
                name: "Каша овсяная",
                photos: [],
                size: 100,
                items: [{ productId: product1.id, quantity: 50 }],
                category: "Второе",
            });
            expect(res.status).toBe(201);
            expect(res.body.dish.calories).toBeCloseTo(350 * 0.5);
            expect(res.body.dish.proteins).toBeCloseTo(12 * 0.5);
            expect(res.body.dish.fats).toBeCloseTo(6 * 0.5);
            expect(res.body.dish.carbs).toBeCloseTo(60 * 0.5);
        });
        it("должен рассчитывать КБЖУ для нулевого количества (класс: ноль)", async () => {
            const res = await (0, supertest_1.default)(app).post("/api/dishes").send({
                name: "Каша овсяная",
                photos: [],
                size: 100,
                items: [{ productId: product1.id, quantity: 0 }],
                category: "Второе",
            });
            expect(res.status).toBe(400);
        });
        it("должен рассчитывать КБЖУ для отрицательного количества (класс: отрицательный)", async () => {
            const res = await (0, supertest_1.default)(app).post("/api/dishes").send({
                name: "Каша овсяная",
                photos: [],
                size: 100,
                items: [{ productId: product1.id, quantity: -50 }],
                category: "Второе",
            });
            expect(res.status).toBe(400);
        });
    });
    // Анализ граничных значений. 0, 1, 100, 1000
    describe("Анализ граничных значений для количества", () => {
        it.each([
            { quantity: 0, expectedMultiplier: 0, status: 400 },
            { quantity: 1, expectedMultiplier: 0.01, status: 201 },
            { quantity: 99, expectedMultiplier: 0.99, status: 201 },
            { quantity: 100, expectedMultiplier: 1, status: 201 },
            { quantity: 101, expectedMultiplier: 1.01, status: 201 },
            { quantity: 999, expectedMultiplier: 9.99, status: 201 },
            { quantity: 1000, expectedMultiplier: 10, status: 201 },
            { quantity: 1001, expectedMultiplier: 10.01, status: 201 },
        ])("должен рассчитывать КБЖУ для граничного значения количества $quantity г", async ({ quantity, expectedMultiplier, status }) => {
            const res = await (0, supertest_1.default)(app).post("/api/dishes").send({
                name: "Каша овсяная",
                photos: [],
                size: 100,
                items: [{ productId: product1.id, quantity }],
                category: "Второе",
            });
            expect(res.status).toBe(status);
            if (status === 201) {
                expect(res.body.dish.calories).toBeCloseTo(350 * expectedMultiplier);
                expect(res.body.dish.proteins).toBeCloseTo(12 * expectedMultiplier);
                expect(res.body.dish.fats).toBeCloseTo(6 * expectedMultiplier);
                expect(res.body.dish.carbs).toBeCloseTo(60 * expectedMultiplier);
            }
        });
    });
    // Тест для суммирования КБЖУ при нескольких ингредиентах
    describe("Расчёт с несколькими продуктами", () => {
        it("должен суммировать КБЖУ для нескольких продуктов", async () => {
            const res = await (0, supertest_1.default)(app).post("/api/dishes").send({
                name: "Каша с молоком",
                photos: [],
                size: 100,
                items: [
                    { productId: product1.id, quantity: 50 },
                    { productId: product2.id, quantity: 100 },
                ],
                category: "Второе",
            });
            expect(res.status).toBe(201);
            const expectedCalories = 350 * 0.5 + 60 * 1;
            const expectedProteins = 12 * 0.5 + 3 * 1;
            const expectedFats = 6 * 0.5 + 3.5 * 1;
            const expectedCarbs = 60 * 0.5 + 4.5 * 1;
            expect(res.body.dish.calories).toBeCloseTo(expectedCalories);
            expect(res.body.dish.proteins).toBeCloseTo(expectedProteins);
            expect(res.body.dish.fats).toBeCloseTo(expectedFats);
            expect(res.body.dish.carbs).toBeCloseTo(expectedCarbs);
        });
    });
    // Тест для переопределения рассчитанных значений КБЖУ вручную
    describe("Ручное переопределение КБЖУ", () => {
        it("должен использовать указанное КБЖУ вместо рассчитанного", async () => {
            const res = await (0, supertest_1.default)(app).post("/api/dishes").send({
                name: "Каша овсяная",
                photos: [],
                size: 100,
                items: [{ productId: product1.id, quantity: 50 }],
                calories: 100,
                proteins: 5,
                fats: 2,
                carbs: 10,
                category: "Второе",
            });
            expect(res.status).toBe(201);
            expect(res.body.dish.calories).toBe(100);
            expect(res.body.dish.proteins).toBe(5);
            expect(res.body.dish.fats).toBe(2);
            expect(res.body.dish.carbs).toBe(10);
        });
    });
});
//# sourceMappingURL=api.dishKbju.test.js.map