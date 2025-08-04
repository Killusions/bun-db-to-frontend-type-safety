<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authClient } from '../client/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

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
  <div class="flex-1 flex-grow overflow-auto flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <Card>
        <!-- Loading state while checking token -->
        <template v-if="isCheckingToken">
          <CardHeader class="space-y-1 text-center">
            <CardTitle class="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>Validating reset token...</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex justify-center">
              <Skeleton class="h-8 w-full" />
            </div>
          </CardContent>
        </template>

        <!-- Invalid token state -->
        <template v-else-if="!isValidToken">
          <CardHeader class="space-y-1 text-center">
            <div class="text-5xl mb-4">⚠️</div>
            <CardTitle class="text-2xl font-bold">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <Button class="w-full" @click="handleRequestNewToken">
              Request New Reset Link
            </Button>
            <Button variant="outline" class="w-full" @click="handleBackToLogin">
              Back to Login
            </Button>
          </CardContent>
        </template>

        <!-- Success state -->
        <template v-else-if="successMessage">
          <CardHeader class="space-y-1 text-center">
            <div class="text-5xl mb-4">✅</div>
            <CardTitle class="text-2xl font-bold">Password Reset Successfully</CardTitle>
            <CardDescription>
              Your password has been updated successfully.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <Alert>
              <AlertDescription>{{ successMessage }}</AlertDescription>
            </Alert>
            <Button class="w-full" @click="handleBackToLogin">
              Go to Login
            </Button>
          </CardContent>
        </template>

        <!-- Reset password form -->
        <template v-else>
          <CardHeader class="space-y-1 text-center">
            <CardTitle class="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Enter your new password below.
            </CardDescription>
          </CardHeader>

          <form @submit.prevent="handleSubmit">
            <CardContent class="space-y-4">
              <!-- Error Alert -->
              <Alert v-if="localError" variant="destructive">
                <AlertDescription>{{ localError }}</AlertDescription>
              </Alert>

              <!-- New Password Field -->
              <div class="space-y-2">
                <Label for="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  v-model="form.password"
                  :disabled="isLoading"
                  required
                />
                <p class="text-sm text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>

              <!-- Confirm Password Field -->
              <div class="space-y-2">
                <Label for="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  v-model="form.confirmPassword"
                  :disabled="isLoading"
                  required
                />
              </div>

              <!-- Reset Button -->
              <Button
                type="submit"
                class="w-full"
                :disabled="isLoading"
              >
                {{ isLoading ? 'Resetting...' : 'Reset Password' }}
              </Button>

              <!-- Back to Login Button -->
              <Button
                type="button"
                variant="outline"
                class="w-full"
                @click="handleBackToLogin"
                :disabled="isLoading"
              >
                Back to Login
              </Button>
            </CardContent>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>
