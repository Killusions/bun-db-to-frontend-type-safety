import { createTRPCClient, createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';
import type { AppRouter } from '../../../backend/router';

// Get the local IP for development
const getBaseUrl = () => {
  // For development, use your local machine's IP
  // You can also use localhost if running in simulator
  const DEV_HOST = process.env.EXPO_PUBLIC_DEV_HOST || 'localhost';
  const PORT = process.env.EXPO_PUBLIC_PORT || '3000';
  const PROTOCOL = process.env.EXPO_PUBLIC_PROTOCOL || 'http';

  if (__DEV__) {
    // For development on device, use your machine's IP
    // For simulator, localhost works fine
    return `${PROTOCOL}://${DEV_HOST}:${PORT}`;
  }

  // For production, use your production URL
  return process.env.EXPO_PUBLIC_API_URL || `${PROTOCOL}://${DEV_HOST}:${PORT}`;
};

// Create tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Create vanilla tRPC client for non-hook usage
export const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api`,
      transformer: superjson,
      headers: async () => {
        // You can add auth headers here if needed
        return {};
      },
    }),
  ],
});

export type Query = inferRouterOutputs<AppRouter>;
