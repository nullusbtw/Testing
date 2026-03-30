import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import { productsRouter } from "./routes/products";
import { dishesRouter } from "./routes/dishes";
import { healthRouter } from "./routes/health";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/health", healthRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/dishes", dishesRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Not found" } });
  });

  app.use(errorHandler);

  return app;
}

