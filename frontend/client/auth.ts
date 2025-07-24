import { client, type Query } from './client';

const authProps: { user: Query["auth"]["me"]["user"] | undefined; roles: Query["auth"]["me"]["roles"]; loggedIn: boolean } = {
  user: undefined,
  roles: [],
  loggedIn: false,
};

export const auth = async (): Promise<void> => {
  // Check if the session is authenticated
  const authResult = await client.auth.me.query();
  if (authResult.user) {
    authProps.user = authResult.user;
    authProps.roles = authResult.roles;
    authProps.loggedIn = true;
  } else {
    authProps.user = undefined;
    authProps.roles = [];
    authProps.loggedIn = false;
  }
}

export default authProps;

await auth();
