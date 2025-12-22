import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import { trpc } from './client';

// Get the base URL for the tRPC server
const getBaseUrl = () => {
  const DEV_HOST = process.env.EXPO_PUBLIC_DEV_HOST || 'localhost';
  const PORT = process.env.EXPO_PUBLIC_PORT || '3000';
  const PROTOCOL = process.env.EXPO_PUBLIC_PROTOCOL || 'http';

  if (__DEV__) {
    return `${PROTOCOL}://${DEV_HOST}:${PORT}`;
  }

  return process.env.EXPO_PUBLIC_API_URL || `${PROTOCOL}://${DEV_HOST}:${PORT}`;
};

interface TRPCProviderProps {
  children: React.ReactNode;
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.data?.httpStatus >= 400 && error?.data?.httpStatus < 500) {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
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
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
