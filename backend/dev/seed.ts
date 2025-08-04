import { strict as assert } from 'assert';
import { randomBytes } from 'crypto';

import { auth } from '../auth/auth';
import { db, tables } from '../db';
import { eq } from 'drizzle-orm';

// Generate a random password for the admin account
const generateRandomPassword = () => {
  return randomBytes(16).toString('hex');
};

const adminEmail = 'admin@mll.one';
const adminName = 'Admin User';
const randomPassword = generateRandomPassword();

const publicPostTitle = 'Example Public Post';
const privatePostTitle = 'Example Private Post';

// Create an admin account if it doesn't exist, and create two sample posts
export const seedAccountAndPosts = async () => {
  let ownerId: string;

  try {
    // Try to create admin account using Better Auth
    const result = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: randomPassword,
        name: adminName,
      }
    });

    if (result) {
      // Get the created user
      const userRecord = await db.query.user.findFirst({
        where: eq(tables.user.email, adminEmail)
      });

      if (userRecord) {
        ownerId = userRecord.id;

        // Create admin role if it doesn't exist
        let adminRole = await db.query.role.findFirst({
          where: eq(tables.role.name, 'admin')
        });

        if (!adminRole) {
          const newRole = await db.insert(tables.role).values({
            id: crypto.randomUUID(),
            name: 'admin',
            description: 'Administrator role'
          }).returning();
          adminRole = newRole[0];
        }

        // Assign admin role to user
        if (adminRole) {
          await db.insert(tables.userRole).values({
            id: crypto.randomUUID(),
            userId: userRecord.id,
            roleId: adminRole.id
          });
        }

        // Verify the admin account email
        await db.update(tables.user)
          .set({ emailVerified: true })
          .where(eq(tables.user.id, userRecord.id));

        console.log(`Admin account created with email: ${adminEmail} and password: ${randomPassword}`);
      } else {
        throw new Error('Failed to find created user');
      }
    } else {
      throw new Error('Failed to create admin account');
    }
  } catch (error: unknown) {
    // Account might already exist, try to get existing user
    const existingUser = await db.query.user.findFirst({
      where: eq(tables.user.email, adminEmail)
    });

    if (existingUser) {
      console.log(`Admin account already exists with email: ${adminEmail}`);
      ownerId = existingUser.id;
    } else {
      console.error('Error creating admin account:', error);
      throw error;
    }
  }

  // Delete all previous posts of the admin account
  const previousPosts = await db.query.posts.findMany({
    where: eq(tables.posts.ownerId, ownerId)
  });

  if (previousPosts.length > 0) {
    await db.delete(tables.posts).where(eq(tables.posts.ownerId, ownerId));
  }

  // Create sample posts
  const publicPostBody = `
This is a public post that everyone can see. It demonstrates the basic functionality of the simple server blog platform.

Key features:
- User authentication with Better Auth
- Role-based access control
- Public and private posts
- Vue 3 frontend with TypeScript
- tRPC for type-safe API communication

This post is visible to all users, whether they're logged in or not.
  `.trim();

  const privatePostBody = `
This is a private post that only the owner can see.
  `.trim();

  // Create public post
  const publicPost = await db.insert(tables.posts).values({
    id: crypto.randomUUID(),
    ownerId,
    title: publicPostTitle,
    body: publicPostBody,
    isPrivate: false,
  }).returning();

  // Create private post
  const privatePost = await db.insert(tables.posts).values({
    id: crypto.randomUUID(),
    ownerId,
    title: privatePostTitle,
    body: privatePostBody,
    isPrivate: true,
  }).returning();

  console.log(`Created ${publicPost.length + privatePost.length} sample posts for admin user`);

  assert(publicPost.length === 1, 'Public post was not created');
  assert(privatePost.length === 1, 'Private post was not created');

  console.log('Database seeding completed successfully!');
};

// For standalone execution
if (import.meta.main) {
  await seedAccountAndPosts();
  process.exit(0);
}
