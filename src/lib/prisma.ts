import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Определяем URL: локально — файл, на Vercel — переменная окружения
const databaseUrl = process.env.NODE_ENV === 'production'
  ? process.env.TURSO_DATABASE_URL!
  : 'file:./dev.db';

const adapter = new PrismaLibSql({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN, // локально не нужен, но адаптер не ругнется
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;