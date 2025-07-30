<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { client } from '../client/client';
import { auth } from '../client/auth';

const router = useRouter();
const route = useRoute();
const error = ref('');
const isLoading = ref(false);

const redirectTo = route.query.redirect?.toString() ?? '/';

const form = reactive({
  email: '',
  password: ''
});

const handleSubmit = async () => {
  if (!form.email || !form.password) {
    error.value = 'Please fill in all fields';
    return;
  }

  error.value = '';
  isLoading.value = true;

  try {
    const res = await client.auth.login.mutate({
      email: form.email,
      password: form.password,
      redirectTo
    });

    await auth();

    router.push(res.redirectTo);
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Login failed. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  display: flex;
  flex-direction: column;
  width: 300px;
  padding: 20px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

button {
  padding: 10px 15px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background-color: #555;
}

button:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 10px;
}
</style>

<template>
  <div class="login-container">
    <form class="login-form" @submit.prevent="handleSubmit">
      <h2>Login</h2>

      <div class="form-group">
        <input
          type="email"
          v-model="form.email"
          placeholder="Email"
          required
        />
      </div>

      <div class="form-group">
        <input
          type="password"
          v-model="form.password"
          placeholder="Password"
          required
        />
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </form>
  </div>
</template>
