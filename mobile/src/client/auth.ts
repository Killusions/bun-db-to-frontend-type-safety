import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { customSessionClient } from "better-auth/client/plugins";
import type { auth as backendClient } from "../../../backend/auth/auth";

// Complete the WebBrowser auth session on web
WebBrowser.maybeCompleteAuthSession();

// Get the base URL for the auth server
const getBaseUrl = () => {
  const DEV_HOST = process.env.EXPO_PUBLIC_DEV_HOST || 'localhost';
  const PORT = process.env.EXPO_PUBLIC_PORT || '3000';
  const PROTOCOL = process.env.EXPO_PUBLIC_PROTOCOL || 'http';

  if (__DEV__) {
    return `${PROTOCOL}://${DEV_HOST}:${PORT}`;
  }

  return process.env.EXPO_PUBLIC_API_URL || `${PROTOCOL}://${DEV_HOST}:${PORT}`;
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  basePath: '/auth',
  plugins: [
    customSessionClient<typeof backendClient>(),
    expoClient({
      scheme: 'simpleserver',
      storagePrefix: 'simpleserver',
      storage: SecureStore,
    }),
  ],
});

// Export the hooks and methods from the client
export const useSession = authClient.useSession;
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;

// Export types
export type User = typeof authClient.$Infer.Session.user;
export type ClientSession = typeof authClient.$Infer.Session;

// Convenience functions for common auth operations
export const login = authClient.signIn.email;
export const register = authClient.signUp.email;
export const logout = authClient.signOut;

// Custom hooks for React Native
export const useAuthStatus = () => {
  const session = useSession();

  return {
    isLoading: session.isPending,
    isAuthenticated: !!session.data?.user,
    user: session.data?.user || null,
    session: session.data || null,
    error: session.error,
  };
};

// Function that returns boolean for authentication status
export const useIsAuthenticated = () => {
  const session = useSession();
  return !!session.data?.user;
};

// Function that returns current user
export const useCurrentUser = () => {
  const session = useSession();
  return session.data?.user || null;
};

// Function for role checking
export const useHasRole = (role: string) => {
  const session = useSession();
  const sessionData = session.data;
  return sessionData?.roles?.includes(role) || false;
};

// Function for admin status
export const useIsAdmin = () => {
  const session = useSession();
  const sessionData = session.data;
  return sessionData?.roles?.includes('admin') || false;
};

// Utility function to check if session is loaded
export const useSessionLoaded = () => {
  const session = useSession();
  return !session.isPending;
};
