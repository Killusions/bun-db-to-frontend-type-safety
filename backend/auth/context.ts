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

export const createContext = async ({ req, res, resHeaders }: { req: Request; res: Response, resHeaders: Response["headers"] }) => {
  const cookies = parseCookies(req);
  const sid = cookies.session;
  let session = null;
  let user = null;
  let roles: string[] = [];
  if (sid) {
    session = await validateSession(sid);
    if (session) {
      // fetch user & roles
      const u = await db.query.users.findFirst({ where: eq(tables.users.id, session.userId) });
      user = u ?? null;
      if (user) {
        roles = (
          await db.select({ role: tables.userRoles.roleName }).from(tables.userRoles).where(eq(tables.userRoles.userId, user.id))
        ).map((r) => r.role);
      }
    }
  }
  return { req, res, resHeaders, session, user, roles, db };
}
export type Context = Awaited<ReturnType<typeof createContext>>;
