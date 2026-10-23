import dotenv from 'dotenv';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

dotenv.config({ path: path.resolve('apps/api/.env') });

export default defineConfig({
  engine: 'classic',
  schema: 'apps/api/prisma/schema.prisma',
  migrations: {
    path: 'apps/api/prisma/migrations',
    seed: 'node apps/api/prisma/seed.js',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
