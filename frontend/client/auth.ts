import { computed } from "vue";
import { createAuthClient } from "better-auth/vue";
import { customSessionClient } from "better-auth/client/plugins";
import type { auth as backendClient } from "../../backend/auth/auth";

const PORT = process.env.PORT || 3000;
const BACKEND_HOST = process.env.BACKEND_HOST || 'localhost';
const BACKEND_PROTOCOL = process.env.BACKEND_PROTOCOL || 'http';

export const authClient = createAuthClient({
  baseURL: `${BACKEND_PROTOCOL}://${BACKEND_HOST}:${PORT}`,
  basePath: '/auth',
  plugins: [customSessionClient<typeof backendClient>()],
});

// Export the hooks and methods from the client
export const useSession = authClient.useSession;
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;

// Export types
export type User = typeof authClient.$Infer.Session.user;
export type Session = typeof authClient.$Infer.Session;

// Convenience functions for common auth operations
export const login = authClient.signIn.email;
export const register = authClient.signUp.email;
export const logout = authClient.signOut;

// Check if session was checked
export const sessionPending = () => {
  const session = useSession();
  return computed(() => !!session.value?.isPending);
};

// Function that returns computed for authentication status
export const isAuthenticated = () => {
  const session = useSession();
  return computed(() => !!session.value?.data?.user);
};

// Function that returns computed for current user
export const getCurrentUser = () => {
  const session = useSession();
  return computed(() => session.value?.data?.user || null);
};

// Function that returns computed for role checking
export const hasRole = (role: string) => {
  const session = useSession();
  return computed(() => {
    const sessionData = session.value?.data;
    return sessionData?.roles?.includes(role) || false;
  });
};

// Function that returns computed for admin status
export const isAdmin = () => {
  const session = useSession();
  return computed(() => {
    const sessionData = session.value?.data;
    return sessionData?.roles?.includes('admin') || false;
  });
};
