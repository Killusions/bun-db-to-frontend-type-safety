import z from 'zod';
import { createSelectSchema } from 'drizzle-zod';

import { tables } from '../db';
import { auth } from './auth';

export type RequestWithCookies = Request & { cookies?: Record<string, string> };

export const contextSchema = z.object({
  session: createSelectSchema(tables.session).pick({
    id: true,
    userId: true,
    expiresAt: true,
  }).optional(),
  user: createSelectSchema(tables.user).pick({
    id: true,
    email: true,
    name: true,
    createdAt: true,
  }).optional(),
  roles: createSelectSchema(tables.role).pick({ name: true }).shape.name.array(),
});

export const createContext = async ({ req, res, resHeaders }: { req: Request; res: Response; resHeaders: Response["headers"]; }) => {
  let session = undefined;
  let user = undefined;
  let roles: string[] = [];

  try {
    // Use BetterAuth to get the session
    const authSession = await auth.api.getSession({
      headers: req.headers,
    });

    if (authSession) {
      session = {
        id: authSession.session.id,
        userId: authSession.session.userId,
        expiresAt: new Date(authSession.session.expiresAt),
      };

      // Get user from BetterAuth session
      const authUser = authSession.user;
      const authRoles = authSession.roles ?? [];

      user = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
        createdAt: new Date()
      };
      // Use roles from BetterAuth user object or default to 'user'
      roles = authRoles.length > 0 ? authRoles : ['user'];
    }
  } catch (error) {
    console.error('Error creating context with BetterAuth:', error);
    // Continue with undefined session/user if there's an error
  }

  contextSchema.parse({
    session,
    user,
    roles,
  });

  return { req, res, resHeaders, session, user, roles };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
export type RequiredContext = {
  [K in keyof Required<Context>]: NonNullable<Required<Context>[K]>;
};

// For local calling - updated to work with BetterAuth format
export const createLocalAdminContext = (email: string, id = 'local-admin-user'): Context => {
  return {
    req: {} as Request,
    res: {} as Response,
    resHeaders: {} as Response["headers"],
    session: {
      id: 'local-admin-session',
      userId: id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 356 * 1000), // 1000 years
    },
    user: {
      id,
      email,
      name: 'Local Admin',
      createdAt: new Date(),
    },
    roles: ['admin']
  };
}
