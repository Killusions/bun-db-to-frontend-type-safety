import { createBunServeHandler } from 'trpc-bun-adapter';
import { generateOpenApiDocument, createOpenApiFetchHandler } from 'trpc-to-openapi';
import { eq } from 'drizzle-orm';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';

import { db, tables } from './db';
import { createContext, createLocalAdminContext } from './auth/context';
import { router, publicProcedure, serverCallerFactory, adminProcedure } from './auth/middleware';
import { auth } from './auth/auth';
import { postsRouter } from './posts/router';

const PORT = process.env.PORT || 3000;

const baseRouter = router({
  getUserInfo: publicProcedure.input(createSelectSchema(tables.user).pick({ id: true })).output(createInsertSchema(tables.user).omit({ email: true, createdAt: true })).meta({ openapi: { method: 'GET', path: '/user/info' } }).query(async ({ input }) => {
    const user = await db.query.user.findFirst({ where: eq(tables.user.id, input.id), columns: { email: false, createdAt: false } });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }),
  getUserByEmail: adminProcedure.input(createSelectSchema(tables.user).pick({ email: true })).output(createSelectSchema(tables.user).extend({ userRoles: createSelectSchema(tables.userRole).array() })).meta({ openapi: { method: 'GET', path: '/user/by-email' } }).query(async ({ input }) => {
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

export const getOpenApiHandler = (req: Request) => {
  const res = new Response();
  const resHeaders = res.headers;
  const fetchHandler = createOpenApiFetchHandler({
    router: server as unknown as any, endpoint: '/openapi', req, createContext: createContext({ req, res, resHeaders }) as unknown as any,
  });
  return (async () => {
    const response = await fetchHandler;
    resHeaders.forEach((value, key) => {
      res.headers.set(key, value);
    });
    return response;
  })();
};

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
    return getOpenApiHandler(req);
  }
});

export const openApiDocument = generateOpenApiDocument(server, {
  title: 'tRPC OpenAPI',
  version: '1.0.0',
  baseUrl: `http://127.0.0.1:${PORT}/openapi`
});

export const serverCaller = serverCallerFactory(server);
export const localAdminCaller = (email: string, id?: string) => serverCaller(createLocalAdminContext(email, id));
