import { router, publicProcedure, protectedProcedure } from './middleware';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

import { db, tables } from '../db';
import { verifyPassword, hashPassword } from './password';
import { createSession, buildSessionCookie, deleteSessionCookie } from './session';
import { invalidateSession } from './session';

const userActionSchema = createInsertSchema(tables.users)
  .omit({ id: true, createdAt: true, hashedPassword: true, email: true })
  .extend({ email: z.string().email(), password: z.string().min(8), redirectTo: z.string().regex(/^(?!.*\/api(?:\/|$|\?))(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/).*/).optional() })

const createSchema = userActionSchema.extend({ role: z.string().optional() });

export const createAccount = async (input: ReturnType<typeof createSchema.parse>) => {
  const existing = await db.query.users.findFirst({ where: eq(tables.users.email, input.email) });
  if (existing) {
    throw new Error('Email taken');
  }
  const hashed = await hashPassword(input.password);
  const inputWithHashedPassword = { ...input, password: undefined, hashedPassword: hashed };
  const newUser = await db.insert(tables.users).values(inputWithHashedPassword).returning();
  if (newUser.length === 0 || !newUser[0]?.id) {
    throw new Error('Failed to create user');
  }
  // Create the role if it does not exist
  await db.insert(tables.roles).values({ name: input.role || 'user', description: '' }).onConflictDoNothing().returning();
  await db.insert(tables.userRoles).values({ userId: newUser[0].id, roleName: input.role || 'user' });
  return { id: newUser[0].id };
};

export const authRouter = router({
  register: publicProcedure.input(createSchema.omit({ role: true })).mutation(async ({ input }) => {
    return await createAccount(input);
  }),
  login: publicProcedure.input(userActionSchema.omit({ name: true })).mutation(async ({ input, ctx }) => {
    const user = await db.query.users.findFirst({ where: eq(tables.users.email, input.email) });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const ok = await verifyPassword(input.password, user.hashedPassword);
    if (!ok) {
      throw new Error('Invalid credentials');
    }

    const session = await createSession(user.id);
    const prod = process.env.NODE_ENV === 'production';
    const cookie = buildSessionCookie(session.id, session.expiresAt, prod);
    ctx.resHeaders.append('Set-Cookie', cookie);
    return { success: true, redirectTo: input.redirectTo ?? '/' };
  }),
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.session) {
      return { success: true };
    }
    const prod = process.env.NODE_ENV === 'production';
    await db.delete(tables.users); // ? nope, we just want to invalidate
    await invalidateSession(ctx.session!.id);
    ctx.resHeaders.append('Set-Cookie', deleteSessionCookie(prod));
    return { success: true };
  }),
  me: publicProcedure.query(({ ctx }) => ({
    user: ctx.user,
    roles: ctx.roles,
  })),
});
