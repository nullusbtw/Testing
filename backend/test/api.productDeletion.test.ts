import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";

const app = createApp();

async function cleanupDb() {
  await prisma.dishProduct.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.product.deleteMany();
}

describe("API - product deletion constraints", () => {
  beforeEach(async () => {
    await cleanupDb();
  });

  it("blocks deleting a product used by at least one dish", async () => {
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

    expect(productRes.status).toBe(201);
    const productId = productRes.body.product.id as number;

    const dishRes = await request(app).post("/api/dishes").send({
      name: "!десерт Печенье",
      photos: [],
      size: 100,
      items: [{ productId, quantity: 50 }],
      // category намеренно не передаём: она должна быть взята из макроса
      // флаги намеренно не передаём: можно оставить пустым набором
    });

    expect(dishRes.status).toBe(201);
    const dishId = dishRes.body.dish.id as number;
    expect(dishRes.body.dish.category).toBe("Десерт");
    expect(dishRes.body.dish.name).toBe("Печенье");

    const deleteRes = await request(app).delete(`/api/products/${productId}`);
    expect(deleteRes.status).toBe(409);
    expect(deleteRes.body.error.code).toBe("PRODUCT_IN_USE");

    const deleteDish = await request(app).delete(`/api/dishes/${dishId}`);
    expect(deleteDish.status).toBe(204);

    const deleteAgain = await request(app).delete(`/api/products/${productId}`);
    expect(deleteAgain.status).toBe(204);
  });
});

