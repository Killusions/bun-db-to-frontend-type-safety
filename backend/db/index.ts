import { SQL } from 'bun';

import { drizzle } from 'drizzle-orm/bun-sql';

import * as tablesSchema from './schema';

export const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/server-db';
export const DATABASE_BASE_URL = DATABASE_URL.split('/').slice(0, -1).join('/');
export const DATABASE_NAME = DATABASE_URL.split('/').pop() || 'server-db';

const baseClient = new SQL(DATABASE_BASE_URL);

try {
  // Query for existing databases
  const existingDatabases = await baseClient`SELECT datname FROM pg_database WHERE datistemplate = false`.values();

  // If the database does not exist, create it
  if (!existingDatabases.some((db: string[]) => db[0] === DATABASE_NAME)) {
    await baseClient.unsafe(`CREATE DATABASE "${DATABASE_NAME}"`);
  }
} catch (_: unknown) {}

baseClient.close();

const client = new SQL(DATABASE_URL);
export const db = drizzle({ client, schema: tablesSchema });

export const tables = tablesSchema;
