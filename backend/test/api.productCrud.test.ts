import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";

const app = createApp();

async function cleanupDb() {
  await prisma.dishProduct.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.product.deleteMany();
}

describe("API - Product CRUD Operations", () => {
  beforeAll(async () => {
    await cleanupDb();
  });

  afterAll(async () => {
    await cleanupDb();
  });

  beforeEach(async () => {
    await prisma.dishProduct.deleteMany();
    await prisma.dish.deleteMany();
  });

  // GET: Чтение продуктов

  describe("GET Operations", () => {
    it("Успешное получение продукта по ID", async () => {
      const createRes = await request(app).post("/api/products").send({
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

      const productId = createRes.body.product.id;
      const res = await request(app).get(`/api/products/${productId}`);

      expect(res.status).toBe(200);
      expect(res.body.product.id).toBe(productId);
      expect(res.body.product.name).toBe("Рис");
    });

    it("Ошибка при получении несуществующего продукта", async () => {
      const res = await request(app).get("/api/products/99999");

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });

  // POST: Создание продукта

  describe("POST Operations", () => {
    it("Успешное создание продукта", async () => {
      const res = await request(app).post("/api/products").send({
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

      expect(res.status).toBe(201);
      expect(res.body.product.name).toBe("Яйцо");
      expect(res.body.product.category).toBe("Замороженный");
    });

    it("Ошибка при создании продукта с некорректными данными", async () => {
      const res = await request(app).post("/api/products").send({
        name: "",
        photos: [],
        caloriesPer100: 100,
        proteinsPer100: 10,
        fatsPer100: 5,
        carbsPer100: 20,
        composition: null,
        category: "Крупы",
        cookingNeed: "Готовый к употреблению",
        vegan: true,
        glutenFree: true,
        sugarFree: true,
      });

      expect(res.status).toBe(400);
    });
  });

  // PUT: Обновление продукта

  describe("PUT Operations", () => {
    it("Успешное обновление имени продукта", async () => {
      const createRes = await request(app).post("/api/products").send({
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

      const productId = createRes.body.product.id;
      const res = await request(app).put(`/api/products/${productId}`).send({
        name: "Рис2",
      });

      expect(res.status).toBe(200);
      expect(res.body.product.name).toBe("Рис2");
    });

    it("Ошибка при обновлении несуществующего продукта", async () => {
      const res = await request(app).put("/api/products/99999").send({
        name: "Новое имя",
      });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });

  // DELETE: Удаление продукта

  describe("DELETE Operations", () => {
    it("Успешное удаление продукта", async () => {
      const createRes = await request(app).post("/api/products").send({
        name: "Продукт для удаления",
        photos: [],
        caloriesPer100: 100,
        proteinsPer100: 10,
        fatsPer100: 5,
        carbsPer100: 20,
        composition: null,
        category: "Крупы",
        cookingNeed: "Готовый к употреблению",
        vegan: true,
        glutenFree: true,
        sugarFree: true,
      });

      const productId = createRes.body.product.id;
      const deleteRes = await request(app).delete(`/api/products/${productId}`);

      expect(deleteRes.status).toBe(204);

      const getRes = await request(app).get(`/api/products/${productId}`);
      expect(getRes.status).toBe(404);
    });

    it("Ошибка при удалении несуществующего продукта", async () => {
      const res = await request(app).delete("/api/products/99999");

      expect(res.status).toBe(404);
    });

    it("Ошибка при удалении продукта, который используется в блюде", async () => {
      const productRes = await request(app).post("/api/products").send({
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

      const productId = productRes.body.product.id;

      const dishRes = await request(app).post("/api/dishes").send({
        name: "!десерт Печенье",
        photos: [],
        size: 100,
        items: [{ productId, quantity: 50 }],
      });

      expect(dishRes.status).toBe(201);

      const deleteRes = await request(app).delete(`/api/products/${productId}`);
      expect(deleteRes.status).toBe(409);
      expect(deleteRes.body.error.code).toBe("PRODUCT_IN_USE");
    });
  });
});