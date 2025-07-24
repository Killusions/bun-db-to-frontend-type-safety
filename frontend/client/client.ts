import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';

import type { AppRouter } from '../../backend/router';

const PORT = process.env.PORT || 3000;
const BACKEND_HOST = process.env.BACKEND_HOST || 'localhost';
const BACKEND_PROTOCOL = process.env.BACKEND_PROTOCOL || 'http';

export const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${BACKEND_PROTOCOL}://${BACKEND_HOST}:${PORT}/api`,
      transformer: superjson,
    }),
  ],
});

export type Query = inferRouterOutputs<AppRouter>;
