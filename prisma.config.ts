import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // Для локальной разработки используем файл dev.db
    // Для продакшена (Vercel) будет использоваться переменная TURSO_DATABASE_URL
    url: process.env.NODE_ENV === 'production'
      ? process.env.TURSO_DATABASE_URL!
      : 'file:./dev.db',
  },
});