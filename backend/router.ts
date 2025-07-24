import { createBunServeHandler } from 'trpc-bun-adapter';
import { eq } from 'drizzle-orm';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';

import { db, tables } from './db';
import { createContext, createLocalAdminContext } from './auth/context';
import { router, publicProcedure, serverCallerFactory, adminProcedure } from './auth/middleware';
import { authRouter } from './auth/router';
import { postsRouter } from './posts/router';

const baseRouter = router({
  getUserInfo: publicProcedure.input(createSelectSchema(tables.users).pick({ id: true })).output(createInsertSchema(tables.users).omit({ email: true, createdAt: true, hashedPassword: true })).query(async ({ input }) => {
    const user = await db.query.users.findFirst({ where: eq(tables.users.id, input.id), columns: { email: false, createdAt: false, hashedPassword: false } });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }),
  getUserByEmail: adminProcedure.input(createSelectSchema(tables.users).pick({ email: true })).output(createSelectSchema(tables.users).omit({ hashedPassword: true }).extend({ userRoles: createSelectSchema(tables.userRoles).array() })).query(async ({ input }) => {
    const user = await db.query.users.findFirst({ where: eq(tables.users.email, input.email), columns: { hashedPassword: false }, with: { userRoles: true } });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }),
});

export const server = router({
  ...baseRouter._def.procedures,
  auth: authRouter,
  posts: postsRouter,
});

export type AppRouter = typeof server;

export default createBunServeHandler({ router: server, endpoint: '/api', createContext }, { fetch: () => new Response('Not Found', { status: 404 }) });

export const serverCaller = serverCallerFactory(server);
export const localAdminCaller = (email: string, id?: string) => serverCaller(createLocalAdminContext(email, id));
