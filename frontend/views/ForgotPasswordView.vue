<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { authClient } from '../client/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  <div class="flex-1 flex-grow overflow-auto flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <Card>
        <template v-if="!isSubmitted">
          <CardHeader class="space-y-1 text-center">
            <CardTitle class="text-2xl font-bold">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you instructions to reset your password.
            </CardDescription>
          </CardHeader>

          <form @submit.prevent="handleSubmit">
            <CardContent class="space-y-4">
              <!-- Error Alert -->
              <Alert v-if="localError" variant="destructive">
                <AlertDescription>{{ localError }}</AlertDescription>
              </Alert>

              <!-- Email Field -->
              <div class="space-y-2">
                <Label for="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  v-model="form.email"
                  :disabled="isLoading"
                  required
                />
              </div>

              <!-- Submit Button -->
              <Button
                type="submit"
                class="w-full"
                :disabled="isLoading"
              >
                {{ isLoading ? 'Sending...' : 'Send Reset Instructions' }}
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

        <!-- Success State -->
        <template v-else>
          <CardHeader class="space-y-1 text-center">
            <div class="text-5xl mb-4">✉️</div>
            <CardTitle class="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription>
              We've sent password reset instructions to <strong>{{ form.email }}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent class="space-y-4">
            <!-- Success Alert -->
            <Alert v-if="successMessage">
              <AlertDescription>{{ successMessage }}</AlertDescription>
            </Alert>

            <!-- Back to Login Button -->
            <Button
              type="button"
              variant="outline"
              class="w-full"
              @click="handleBackToLogin"
            >
              Back to Login
            </Button>
          </CardContent>
        </template>
      </Card>
    </div>
  </div>
</template>
