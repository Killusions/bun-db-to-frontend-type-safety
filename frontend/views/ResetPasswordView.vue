<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authClient } from '../client/auth';

const router = useRouter();
const localError = ref('');
const successMessage = ref('');
const token = ref('');
const isValidToken = ref(false);
const isCheckingToken = ref(true);
const isLoading = ref(false);

const form = reactive({
  password: '',
  confirmPassword: '',
});

onMounted(async () => {
  // Get token from raw URL param, not router (because of how better-auth's backend works)
  token.value = new URLSearchParams(window.location.search).get('token') || '';

  console.log('Reset token:', token.value);

  if (!token.value) {
    localError.value = 'Invalid or missing reset token';
    isCheckingToken.value = false;
    return;
  }

  // Validate token by checking if it exists (simple check)
  isValidToken.value = true;
  isCheckingToken.value = false;
});

const handleSubmit = async () => {
  // Reset messages
  localError.value = '';
  successMessage.value = '';

  // Validate form
  if (!form.password) {
    localError.value = 'Please enter a new password';
    return;
  }

  if (form.password.length < 8) {
    localError.value = 'Password must be at least 8 characters long';
    return;
  }

  if (form.password !== form.confirmPassword) {
    localError.value = 'Passwords do not match';
    return;
  }

  isLoading.value = true;
  try {
    const { error } = await authClient.resetPassword({
      token: token.value,
      newPassword: form.password,
    });

    if (error) {
      localError.value = error.message || 'Failed to reset password. Please try again or request a new reset link.';
    } else {
      successMessage.value = 'Your password has been reset successfully. You can now log in with your new password.';

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  } catch (err) {
    localError.value = 'Failed to reset password. Please try again or request a new reset link.';
  } finally {
    isLoading.value = false;
  }
};

const handleBackToLogin = () => {
  router.push('/login');
};

const handleRequestNewToken = () => {
  router.push('/forgot-password');
};
</script>

<template>
  <div class="reset-password-container">
    <div class="reset-password-form">
      <!-- Loading state while checking token -->
      <div v-if="isCheckingToken" class="checking-token">
        <div class="spinner"></div>
        <p>Validating reset token...</p>
      </div>

      <!-- Invalid token state -->
      <div v-else-if="!isValidToken" class="error-state">
        <div class="icon">⚠️</div>
        <h3>Invalid Reset Link</h3>
        <p>This password reset link is invalid or has expired.</p>

        <button
          type="button"
          class="submit-button"
          @click="handleRequestNewToken"
        >
          Request New Reset Link
        </button>

        <button
          type="button"
          class="secondary-button"
          @click="handleBackToLogin"
        >
          Back to Login
        </button>
      </div>

      <!-- Success state -->
      <div v-else-if="successMessage" class="success-state">
        <div class="icon">✅</div>
        <h3>Password Reset Successfully</h3>
        <div class="success-message">
          {{ successMessage }}
        </div>

        <button
          type="button"
          class="submit-button"
          @click="handleBackToLogin"
        >
          Go to Login
        </button>
      </div>

      <!-- Reset password form -->
      <div v-else class="form-content">
        <div class="form-header">
          <h2>Reset Password</h2>
          <p>Enter your new password below.</p>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="password">New Password</label>
            <input
              id="password"
              type="password"
              v-model="form.password"
              placeholder="Enter new password"
              required
              :disabled="isLoading"
            />
            <div class="password-strength">
              Password must be at least 8 characters long
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              v-model="form.confirmPassword"
              placeholder="Confirm new password"
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
            {{ isLoading ? 'Resetting...' : 'Reset Password' }}
          </button>

          <button
            type="button"
            class="secondary-button"
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
    </div>
  </div>
</template>

<style scoped>
.reset-password-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.reset-password-form {
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

.password-strength {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
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
  margin-bottom: 15px;
}

.submit-button:hover:not(:disabled) {
  background-color: #555;
}

.submit-button:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.secondary-button {
  width: 100%;
  padding: 12px;
  background-color: transparent;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  margin-bottom: 10px;
}

.secondary-button:hover {
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
  text-align: center;
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

.error-state {
  text-align: center;
}

.error-state .icon {
  font-size: 48px;
  color: #ef4444;
  margin-bottom: 20px;
}

.error-state h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 20px;
}

.error-state p {
  margin: 0 0 30px 0;
  color: #666;
  line-height: 1.5;
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

.checking-token {
  text-align: center;
  padding: 40px 0;
}

.checking-token .spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid #ddd;
  border-radius: 50%;
  border-top-color: #333;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>