<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSession } from '../client/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const router = useRouter();
const route = useRoute();
const isProcessing = ref(true);
const error = ref('');
const message = ref('Processing authentication...');
const session = useSession();

// Computed values
const currentUser = computed(() => session.value?.data?.user);

onMounted(async () => {
  try {
    // Check for error in URL params (OAuth error)
    const errorParam = route.query.error as string;
    if (errorParam) {
      error.value = `Authentication failed: ${errorParam}`;
      message.value = 'Authentication was cancelled or failed.';
      isProcessing.value = false;
      return;
    }

    // Check for success callback
    const code = route.query.code as string;
    const state = route.query.state as string;

    if (code || state) {
      message.value = 'Completing authentication...';

      // Give Better Auth a moment to process the callback
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user is now authenticated
      if (currentUser.value) {
        message.value = 'Authentication successful! Redirecting...';

        // Get redirect URL from query params or default to home
        const redirectUrl = route.query.redirectTo as string || '/';

        // Redirect after a short delay
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1500);
      } else {
        error.value = 'Authentication completed but session not found';
        message.value = 'Please try logging in again.';
        isProcessing.value = false;
      }
    } else {
      // No callback parameters found
      error.value = 'Invalid authentication callback';
      message.value = 'No authentication data found.';
      isProcessing.value = false;
    }
  } catch (err) {
    console.error('Auth callback error:', err);
    error.value = err instanceof Error ? err.message : 'Authentication failed';
    message.value = 'There was an error processing your authentication.';
    isProcessing.value = false;
  }
});

const handleRetry = () => {
  router.push('/login');
};

const handleGoHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="flex-1 flex-grow overflow-auto flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <Card class="w-full">
        <CardHeader class="text-center">
          <div class="mx-auto mb-4">
            <!-- Processing state -->
            <div v-if="isProcessing && !error" class="flex flex-col items-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
              <div class="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                <div class="bg-blue-600 h-1.5 rounded-full animate-pulse" style="width: 70%"></div>
              </div>
            </div>

            <!-- Success state -->
            <div v-else-if="!error && !isProcessing" class="text-green-500 text-6xl mb-4">
              ✅
            </div>

            <!-- Error state -->
            <div v-else class="text-red-500 text-6xl mb-4">
              ❌
            </div>
          </div>

          <CardTitle class="text-2xl font-bold">
            <span v-if="isProcessing && !error">Processing Authentication</span>
            <span v-else-if="!error && !isProcessing">Authentication Successful!</span>
            <span v-else>Authentication Failed</span>
          </CardTitle>

          <CardDescription class="mt-2">
            {{ message }}
          </CardDescription>
        </CardHeader>

        <CardContent class="space-y-4">
          <!-- Loading skeleton for processing -->
          <div v-if="isProcessing && !error" class="space-y-3">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-3/4" />
            <Skeleton class="h-4 w-1/2" />
          </div>

          <!-- Success message -->
          <Alert v-else-if="!error && !isProcessing" class="border-green-200 bg-green-50">
            <AlertDescription class="text-green-800">
              You will be redirected automatically in a moment.
            </AlertDescription>
          </Alert>

          <!-- Error state -->
          <div v-else class="space-y-4">
            <Alert v-if="error" variant="destructive">
              <AlertDescription>
                {{ error }}
              </AlertDescription>
            </Alert>

            <div class="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button
                @click="handleRetry"
                class="flex-1"
              >
                Try Again
              </Button>

              <Button
                @click="handleGoHome"
                variant="outline"
                class="flex-1"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
