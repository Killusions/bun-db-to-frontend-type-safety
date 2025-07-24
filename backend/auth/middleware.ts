import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

import type { Context } from './context';

const t = initTRPC.context<Context>().create({ transformer: superjson });

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
export const protectedProcedure = t.procedure.use(authed);
export const roleProtectedProcedure = (required: string | string[]) =>
  t.procedure.use(authed).use(hasRole(required));
export const adminProcedure = t.procedure.use(authed).use(hasRole('admin'));
