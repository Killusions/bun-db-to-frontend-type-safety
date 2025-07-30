import { ref } from 'vue';
import { client, type Query } from './client';

export const user = ref<Query["auth"]["me"]["user"]>(undefined);
export const roles = ref<Query["auth"]["me"]["roles"]>([]);
export const loggedIn = ref(false);

export const auth = async (): Promise<void> => {
  // Check if the session is authenticated
  const authResult = await client.auth.me.query();
  if (authResult.user) {
    user.value = authResult.user;
    roles.value = authResult.roles;
    loggedIn.value = true;
  } else {
    user.value = undefined;
    roles.value = [];
    loggedIn.value = false;
  }
}

await auth();
