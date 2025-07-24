import { SQL } from 'bun';

import { drizzle } from 'drizzle-orm/bun-sql';

import * as tablesSchema from './schema';

export const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/server-db';
export const DATABASE_BASE_URL = DATABASE_URL.split('/').slice(0, -1).join('/');
export const DATABASE_NAME = DATABASE_URL.split('/').pop() || 'server-db';

// Persist db client in global scope to avoid multiple connections in development (when hot reloading).
declare global {
  var dbClient: SQL | undefined;
}

let client: SQL;
if (globalThis.dbClient !== undefined) {
  client = globalThis.dbClient;
} else {
  const baseClient = new SQL(DATABASE_BASE_URL);

  try {
    // Query for existing databases
    let existingDatabases = await baseClient`SELECT datname FROM pg_database WHERE datistemplate = false`.values();

    // If WIPE_DATABASE is set, drop the existing database
    if (existingDatabases.some((db: string[]) => db[0] === DATABASE_NAME) && process.env.WIPE_DATABASE === 'true') {
      console.log(`Wiping database: ${DATABASE_NAME}`);

      await baseClient.unsafe(`DROP DATABASE IF EXISTS "${DATABASE_NAME}"`);
      existingDatabases = [];
    }

    // If the database does not exist, create it
    if (!existingDatabases.some((db: string[]) => db[0] === DATABASE_NAME)) {
      console.log(`Creating database: ${DATABASE_NAME}`);
      await baseClient.unsafe(`CREATE DATABASE "${DATABASE_NAME}"`);
    }
  } catch (_: unknown) {}

  baseClient.close();

  client = new SQL(DATABASE_URL);
  globalThis.dbClient = client;
  console.log(`Connected to database: ${DATABASE_NAME}`);
}

export const db = drizzle({ client, schema: tablesSchema });

export const tables = tablesSchema;
