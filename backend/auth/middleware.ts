import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

import type { Context, RequiredContext } from './context';

const t = initTRPC.context<Context>().create({ transformer: superjson });
// Only for type safety, not used at runtime
const requiredContext = initTRPC.context<RequiredContext>();
type RequiredContextType = ReturnType<typeof requiredContext.create>;

export const authed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next();
});

export const hasRole = (required: string | string[]) =>
  t.middleware(({ ctx, next }) => {
    const needed = Array.isArray(required) ? required : [required];
    if (!needed.some((r) => ctx.roles.includes(r))) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    return next();
  });

export const router = t.router;
export const publicProcedure = t.procedure;
const loggedInProcedure = (t as unknown as RequiredContextType).procedure;
export const protectedProcedure = loggedInProcedure.use(authed);
export const roleProtectedProcedure = (required: string | string[]) => loggedInProcedure.use(authed).use(hasRole(required));
export const adminProcedure = loggedInProcedure.use(authed).use(hasRole('admin'));

export const serverCallerFactory = t.createCallerFactory;
