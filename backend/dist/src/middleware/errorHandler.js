"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const httpError_1 = require("../lib/httpError");
function errorHandler(err, _req, res, _next) {
    if (err instanceof httpError_1.HttpError) {
        return res.status(err.status).json({
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
            },
        });
    }
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: {
                code: "BAD_REQUEST",
                message: "Validation error",
                details: err.flatten(),
            },
        });
    }
    // Handle Prisma errors
    const prismaError = err;
    if (prismaError?.code === "P2025") {
        return res.status(404).json({
            error: {
                code: "NOT_FOUND",
                message: "Record not found",
            },
        });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({
        error: {
            code: "INTERNAL_ERROR",
            message: "Unexpected server error",
        },
    });
}
//# sourceMappingURL=errorHandler.js.map