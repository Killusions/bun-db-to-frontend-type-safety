<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { authClient } from '../client/auth';

const router = useRouter();
const localError = ref('');
const successMessage = ref('');
const isSubmitted = ref(false);
const isLoading = ref(false);

const form = reactive({
  email: '',
});

const handleSubmit = async () => {
  // Reset messages
  localError.value = '';
  successMessage.value = '';

  // Validate form
  if (!form.email) {
    localError.value = 'Please enter your email address';
    return;
  }

  if (!form.email.includes('@')) {
    localError.value = 'Please enter a valid email address';
    return;
  }

  isLoading.value = true;
  try {
    console.log(`${window.location.protocol}//${window.location.host}${window.location.pathname}#${router.getRoutes().find(route => route.path.includes('reset-password'))!.path.split(':').at(0)}`);
    const { error } = await authClient.requestPasswordReset({
      email: form.email,
      redirectTo: `${window.location.protocol}//${window.location.host}${window.location.pathname}#${router.getRoutes().find(route => route.path.includes('reset-password'))!.path.split(':').at(0)}` // So it throws if it's not found.
    });

    if (error) {
      localError.value = error.message || 'Failed to send password reset email. Please try again.';
    } else {
      isSubmitted.value = true;
      successMessage.value = 'Password reset instructions have been sent to your email address.';
    }
  } catch (err) {
    localError.value = 'Failed to send password reset email. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const handleBackToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <div class="forgot-password-container">
    <div class="forgot-password-form">
      <div v-if="!isSubmitted" class="form-content">
        <div class="form-header">
          <h2>Forgot Password</h2>
          <p>Enter your email address and we'll send you instructions to reset your password.</p>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              type="email"
              v-model="form.email"
              placeholder="Enter your email address"
              required
              :disabled="isLoading"
            />
          </div>

          <button
            type="submit"
            class="submit-button"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ isLoading ? 'Sending...' : 'Send Reset Instructions' }}
          </button>

          <button
            type="button"
            class="back-button"
            @click="handleBackToLogin"
            :disabled="isLoading"
          >
            Back to Login
          </button>

          <div v-if="localError" class="error-message">
            {{ localError }}
          </div>
        </form>
      </div>

      <div v-else class="success-state">
        <div class="icon">✉️</div>
        <h3>Check Your Email</h3>
        <p>We've sent password reset instructions to <strong>{{ form.email }}</strong></p>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <button
          type="button"
          class="back-button"
          @click="handleBackToLogin"
        >
          Back to Login
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forgot-password-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.forgot-password-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
}

.form-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #333;
  box-shadow: 0 0 0 2px rgba(51, 51, 51, 0.1);
}

input:disabled {
  background-color: #f9f9f9;
  cursor: not-allowed;
}

.submit-button {
  width: 100%;
  padding: 12px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s ease;
  margin-bottom: 20px;
}

.submit-button:hover:not(:disabled) {
  background-color: #555;
}

.submit-button:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.back-button {
  width: 100%;
  padding: 12px;
  background-color: transparent;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #f9f9f9;
  border-color: #333;
}

.success-message {
  background-color: #f0f9ff;
  border: 1px solid #0ea5e9;
  color: #0369a1;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.5;
}

.error-message {
  background-color: #fef2f2;
  border: 1px solid #f87171;
  color: #dc2626;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
}

.success-state {
  text-align: center;
}

.success-state .icon {
  font-size: 48px;
  color: #10b981;
  margin-bottom: 20px;
}

.success-state h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 20px;
}

.success-state p {
  margin: 0 0 30px 0;
  color: #666;
  line-height: 1.5;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>