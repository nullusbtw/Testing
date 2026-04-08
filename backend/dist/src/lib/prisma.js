"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const client_1 = require("@prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
// Avoid creating a new PrismaClient on every hot-reload in dev.
const globalForPrisma = global;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL is required (set it in backend/.env)");
}
// Prisma 7 "client" engine expects an adapter factory. For SQLite we can use better-sqlite3.
const sqliteFilePath = databaseUrl.startsWith("file:") ? databaseUrl.slice("file:".length) : databaseUrl;
const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({ url: sqliteFilePath });
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        adapter,
        log: ["error", "warn"],
    });
if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = exports.prisma;
}
//# sourceMappingURL=prisma.js.map