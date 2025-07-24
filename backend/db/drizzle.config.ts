import { defineConfig } from 'drizzle-kit';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/server-db';

export default defineConfig({
  dialect: 'postgresql',
  schema: './backend/db/schema.ts',
  dbCredentials: {
    url: DATABASE_URL
  },
})
