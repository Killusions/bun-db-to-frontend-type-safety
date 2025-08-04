import { $ } from 'bun';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';

const tmpFileLocation = 'tmp/authSchemaVersion';

export const generateAuthSchema = async (regenerate = false) => {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
  const currentVersion = packageJson.devDependencies['@better-auth/cli'];
  if (!regenerate && existsSync(tmpFileLocation)) {
    const version = readFileSync(tmpFileLocation, 'utf-8');
    if (version === currentVersion) {
      return;
    }
  }
  await $`bunx --bun @better-auth/cli generate --config backend/auth/auth.ts --output backend/db/base-schema.ts --yes`;
  mkdirSync('tmp', { recursive: true });
  writeFileSync(tmpFileLocation, JSON.parse(readFileSync('package.json', 'utf-8')).devDependencies['@better-auth/cli']);
  console.log('Auth schema generated successfully');
}

// For standalone execution
if (import.meta.main) {
  await generateAuthSchema(true);
  process.exit(0);
}
