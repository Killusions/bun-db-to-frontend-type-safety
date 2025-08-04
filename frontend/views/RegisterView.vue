<script lang="ts" setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSession, signUp } from '../client/auth';
import SocialLogin from '../components/SocialLogin.vue';

const router = useRouter();
const error = ref('');
const isLoading = ref(false);
const successMessage = ref('');
const session = useSession();

// Computed values
const currentUser = computed(() => session.value?.data?.user);

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

onMounted(() => {
});

const handleSubmit = async () => {
  // Reset error and success message
  error.value = '';
  successMessage.value = '';

  // Validate form
  if (!form.name || !form.email || !form.password) {
    error.value = 'Please fill in all fields';
    return;
  }

  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match';
    return;
  }

  if (form.password.length < 8) {
    error.value = 'Password must be at least 8 characters long';
    return;
  }

  isLoading.value = true;

  try {
    const { error: authError } = await signUp.email({
      email: form.email,
      password: form.password,
      name: form.name,
      callbackURL: `${window.location.protocol}//${window.location.host}${window.location.pathname}#${router.getRoutes().find(route => route.path.includes('login'))!.path.split(':').at(0)}`
    });

    if (authError) {
      error.value = authError.message || 'Registration failed. Please try again.';
    } else {
      // Registration successful, redirect to home
      router.push('/login?unverified=true');
    }
  } catch (err) {
    console.log(err);
    error.value = 'Registration failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="register-container">
    <form class="register-form" @submit.prevent="handleSubmit">
      <h2>Register</h2>

      <div class="form-group">
        <input
          type="text"
          v-model="form.name"
          placeholder="Name"
          required
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <input
          type="email"
          v-model="form.email"
          placeholder="Email"
          required
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <input
          type="password"
          v-model="form.password"
          placeholder="Password"
          required
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <input
          type="password"
          v-model="form.confirmPassword"
          placeholder="Confirm Password"
          required
          :disabled="isLoading"
        />
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Registering...' : 'Register' }}
      </button>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <!-- Social Login -->
      <SocialLogin
        redirectTo="/"
        :showDivider="true"
        buttonStyle="full"
        size="medium"
      />

      <div class="login-link">
        Already have an account? <a @click.prevent="router.push('/login')" href="/login">Login</a>
      </div>
    </form>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.register-form {
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

.success-message {
  color: #2ecc71;
  font-size: 14px;
  margin-top: 10px;
}

.login-link {
  margin-top: 15px;
  font-size: 14px;
  text-align: center;
}

.login-link a {
  color: #333;
  text-decoration: underline;
}

.login-link a:hover {
  color: #555;
}
</style>