import { eq } from 'drizzle-orm';

import { db, tables } from '../db';
import { validateSession } from './session';

export type RequestWithCookies = Request & { cookies?: Record<string, string> };

const parseCookies = (req: Request): Record<string, string> => {
  const header = req.headers.get('cookie');
  if (!header) {
    return {};
  }
  return Object.fromEntries(
    header.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      if (!k || v.length === 0) {
        return [];
      }
      return [decodeURIComponent(k), decodeURIComponent(v.join('='))];
    })
  );
}

export const createContext = async ({ req, res, resHeaders }: { req: Request; res: Response; resHeaders: Response["headers"]; }) => {
  const cookies = parseCookies(req);
  const sid = cookies.session;
  let session = undefined;
  let user = undefined;
  let roles: string[] = [];
  if (sid) {
    session = await validateSession(sid);
    if (session) {
      // fetch user & roles
      let u = await db.query.users.findFirst({ columns: { id: true, email: true, name: true, createdAt: true }, where: eq(tables.users.id, session.userId), with: { userRoles: {
        columns: { roleName: true }
      } } });
      if (!u) {
        throw new Error('Session user not found');
      }
      let {
        userRoles: roles,
        ...userProps
      } = u;
      user = userProps;
    }
  }
  return { req, res, resHeaders, session, user, roles };
}
export type Context = Awaited<ReturnType<typeof createContext>>;
export type RequiredContext = {
  [K in keyof Required<Context>]: NonNullable<Required<Context>[K]>;
};

// For local calling.
export const createLocalAdminContext = (email: string, id = 'local-admin-user'): Context => {
  return {
    req: {} as Request,
    res: {} as Response,
    resHeaders: {} as Response["headers"],
    session: {
      id: 'local-admin-session',
      userId: id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 356 * 1000), // 1000 years
      idleExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 356 * 1000) // 1000 years
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
