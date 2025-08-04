import { createBunServeHandler } from 'trpc-bun-adapter';
import { eq } from 'drizzle-orm';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';

import { db, tables } from './db';
import { createContext, createLocalAdminContext } from './auth/context';
import { router, publicProcedure, serverCallerFactory, adminProcedure } from './auth/middleware';
import { auth } from './auth/auth';
import { postsRouter } from './posts/router';

const baseRouter = router({
  getUserInfo: publicProcedure.input(createSelectSchema(tables.user).pick({ id: true })).output(createInsertSchema(tables.user).omit({ email: true, createdAt: true })).query(async ({ input }) => {
    const user = await db.query.user.findFirst({ where: eq(tables.user.id, input.id), columns: { email: false, createdAt: false } });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }),
  getUserByEmail: adminProcedure.input(createSelectSchema(tables.user).pick({ email: true })).output(createSelectSchema(tables.user).extend({ userRoles: createSelectSchema(tables.userRole).array() })).query(async ({ input }) => {
    const user = await db.query.user.findFirst({ where: eq(tables.user.email, input.email), with: { userRoles: true } });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }),
});

export const server = router({
  ...baseRouter._def.procedures,
  posts: postsRouter,
});

export type AppRouter = typeof server;

export const getAuthHandler = (req: Request) => {
  return auth.handler(req);
};

export default createBunServeHandler({ router: server, endpoint: '/api', createContext }, {
  fetch: (req) => {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/auth')) {
      console.log('Handling auth request:', url.pathname);
      return getAuthHandler(req);
    }
    return new Response('Not Found', { status: 404 });
  }
});

export const serverCaller = serverCallerFactory(server);
export const localAdminCaller = (email: string, id?: string) => serverCaller(createLocalAdminContext(email, id));
