import { router, publicProcedure, protectedProcedure, adminProcedure } from './middleware';
import { z } from 'zod';
import { and, eq, type SQL } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { db, tables } from '../db';
import { verifyPassword, hashPassword } from './password';
import { createSession, buildSessionCookie, deleteSessionCookie } from './session';
import { invalidateSession } from './session';

// By deriving it instead of re-defining it, we ensure that the schema is always in sync with the database schema, especially when new fields are added.
const userActionSchema = createInsertSchema(tables.users)
  .omit({ id: true, createdAt: true, hashedPassword: true, email: true })
  .extend({ email: z.string().email(), password: z.string().min(8), redirectTo: z.string().regex(/^(?!.*\/api(?:\/|$|\?))(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/).*/).optional() })

const createSchema = userActionSchema.extend({ role: z.string().optional() });

const createAccount = async (input: z.infer<typeof createSchema>) => {
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
  register: publicProcedure.input(createSchema.omit({ role: true })).output(createInsertSchema(tables.users).pick({ id: true })).mutation(async ({ input }) => {
    const account = await createAccount(input);
    return { id: account.id };
  }),
  login: publicProcedure.input(userActionSchema.omit({ name: true })).output(userActionSchema.pick({ redirectTo: true }).required({ redirectTo: true })).mutation(async ({ input, ctx }) => {
    const user = await db.query.users.findFirst({ where: and(eq(tables.users.email, input.email)) });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const ok = await verifyPassword(input.password, user.hashedPassword);
    if (!ok) {
      throw new Error('Invalid credentials');
    }

    const session = await createSession(user.id);
    const prod = process.env.BACKEND_HOST !== 'localhost';
    const cookie = buildSessionCookie(session.id, session.expiresAt, prod);
    ctx.resHeaders.append('Set-Cookie', cookie);
    return { redirectTo: input.redirectTo ?? '/' };
  }),
  logout: protectedProcedure.input(z.void()).output(z.void()).mutation(async ({ ctx }) => {
    if (!ctx.session) {
      return;
    }
    const prod = process.env.BACKEND_HOST !== 'localhost';
    await invalidateSession(ctx.session.id);
    ctx.resHeaders.append('Set-Cookie', deleteSessionCookie(prod));
  }),
  me: publicProcedure.input(z.void()).output(z.object({
    user: createSelectSchema(tables.users).pick({ id: true, email: true, name: true, createdAt: true }).optional(),
    roles: z.array(z.string())
  })).query(({ ctx }) => ({
    user: ctx.user,
    roles: ctx.roles,
  })),
  createAccount: adminProcedure.input(createSchema).output(createSelectSchema(tables.users).pick({ id: true })).mutation(async ({ input }) => {
    const account = await createAccount(input);
    return { id: account.id };
  })
});
