import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaLibSql({
  url: "libsql://memonotes-derinsergey86.aws-eu-west-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODA0MDEwNzksImlkIjoiMDE5ZTg4MjctZTAwMS03MjUzLTk2YmItZTc3MzJjMjhkOTY3IiwicmlkIjoiNmU2ZjAyZmItMzZhYi00ZjIyLWJkYmItYTViMWE3YjVhNTAzIn0.HoMAv-F4Qie2FHh6TuRY-kshIY4SF3kkTLzVY6D7xFIRGYH1sR5_dYkDh4P_MIVjLj7FVmEIpi1WuRTDP_nxAg",
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;