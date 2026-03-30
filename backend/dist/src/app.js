"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middleware/errorHandler");
const products_1 = require("./routes/products");
const dishes_1 = require("./routes/dishes");
const health_1 = require("./routes/health");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use("/api/health", health_1.healthRouter);
    app.use("/api/products", products_1.productsRouter);
    app.use("/api/dishes", dishes_1.dishesRouter);
    app.use((_req, res) => {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Not found" } });
    });
    app.use(errorHandler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map