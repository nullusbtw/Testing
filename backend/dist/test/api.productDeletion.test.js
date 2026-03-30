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
describe("API - product deletion constraints", () => {
    beforeEach(async () => {
        await cleanupDb();
    });
    it("blocks deleting a product used by at least one dish", async () => {
        const productRes = await (0, supertest_1.default)(app).post("/api/products").send({
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
        expect(productRes.status).toBe(201);
        const productId = productRes.body.product.id;
        const dishRes = await (0, supertest_1.default)(app).post("/api/dishes").send({
            name: "!десерт Печенье",
            photos: [],
            size: 100,
            items: [{ productId, quantity: 50 }],
            // category намеренно не передаём: она должна быть взята из макроса
            // флаги намеренно не передаём: можно оставить пустым набором
        });
        expect(dishRes.status).toBe(201);
        const dishId = dishRes.body.dish.id;
        expect(dishRes.body.dish.category).toBe("Десерт");
        expect(dishRes.body.dish.name).toBe("Печенье");
        const deleteRes = await (0, supertest_1.default)(app).delete(`/api/products/${productId}`);
        expect(deleteRes.status).toBe(409);
        expect(deleteRes.body.error.code).toBe("PRODUCT_IN_USE");
        const deleteDish = await (0, supertest_1.default)(app).delete(`/api/dishes/${dishId}`);
        expect(deleteDish.status).toBe(204);
        const deleteAgain = await (0, supertest_1.default)(app).delete(`/api/products/${productId}`);
        expect(deleteAgain.status).toBe(204);
    });
});
//# sourceMappingURL=api.productDeletion.test.js.map