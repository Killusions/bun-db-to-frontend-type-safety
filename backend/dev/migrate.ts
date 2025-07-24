import { $ } from "bun";

export const migrate = async () => {
  // Run db migrations
  await $`bun run drizzle-kit push --config backend/db/drizzle.config.ts`;
};


// For standalone execution
if (import.meta.main) {
  await migrate();
  process.exit(0);
}
