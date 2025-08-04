import { db, tables } from '../db';
import { eq } from 'drizzle-orm';

export async function setupAuth() {
  try {
    // Create default roles if they don't exist
    const defaultRoles = [
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'user', description: 'Default user role' }
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await db.query.role.findFirst({
        where: eq(tables.role.name, roleData.name)
      });

      if (!existingRole) {
        await db.insert(tables.role).values({
          id: crypto.randomUUID(),
          name: roleData.name,
          description: roleData.description
        });
        console.log(`✓ Created role: ${roleData.name}`);
      } else {
        console.log(`✓ Role already exists: ${roleData.name}`);
      }
    }

    // Ensure environment variables are set
    if (!process.env.BETTER_AUTH_SECRET) {
      console.warn('⚠️  BETTER_AUTH_SECRET not set. Using default for development.');
    }

    if (!process.env.BETTER_AUTH_URL) {
      console.warn('⚠️  BETTER_AUTH_URL not set. Using default for development.');
    }

    console.log('✓ Authentication setup complete');
    return true;
  } catch (error) {
    console.error('✗ Authentication setup failed:', error);
    return false;
  }
}

// For standalone execution
if (import.meta.main) {
  await setupAuth();
  process.exit(0);
}
