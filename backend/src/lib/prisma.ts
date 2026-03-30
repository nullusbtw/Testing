import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Avoid creating a new PrismaClient on every hot-reload in dev.
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required (set it in backend/.env)");
}

// Prisma 7 "client" engine expects an adapter factory. For SQLite we can use better-sqlite3.
const sqliteFilePath = databaseUrl.startsWith("file:") ? databaseUrl.slice("file:".length) : databaseUrl;
const adapter = new PrismaBetterSqlite3({ url: sqliteFilePath });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

