<script lang="ts" setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSession, signIn } from '../client/auth';
import SocialLogin from '../components/SocialLogin.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const router = useRouter();
const route = useRoute();
const error = ref('');
const isLoading = ref(false);
const showRegisterLink = ref(true);
const showVerificationMessage = ref(false);

const redirectTo = route.query.redirect?.toString() ?? '/';
const session = useSession();

// Computed values
const currentUser = computed(() => session.value?.data?.user);

const form = reactive({
  email: '',
  password: ''
});

onMounted(() => {
  // Get token from raw URL param, not router (because of how better-auth's backend works)
  showVerificationMessage.value = !!(route.query.unverified);
});

const handleSubmit = async () => {
  if (!form.email || !form.password) {
    error.value = 'Please fill in all fields';
    return;
  }

  error.value = '';
  isLoading.value = true;

  try {
    const { error: authError } = await signIn.email({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      error.value = authError.message || 'Login failed. Please try again.';
    } else {
      router.push(redirectTo);
    }
  } catch (err) {
    error.value = 'Login failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const handleForgotPassword = () => {
  router.push('/forgot-password');
};
</script>

<template>
  <div class="flex-1 flex-grow overflow-auto flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <Card>
        <CardHeader class="space-y-1">
          <CardTitle class="text-2xl font-bold">Sign in to your account</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>

        <form @submit.prevent="handleSubmit">
          <CardContent class="space-y-4">
            <!-- Error Alert -->
            <Alert v-if="error" variant="destructive">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>

            <!-- Verification Message -->
            <Alert v-if="showVerificationMessage" variant="default">
              <AlertDescription>
                Your email is not verified. Please check your inbox for the verification email before logging in.
              </AlertDescription>
            </Alert>

            <!-- Email Field -->
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                v-model="form.email"
                :disabled="isLoading"
                required
              />
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <Label for="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                v-model="form.password"
                :disabled="isLoading"
                required
              />
            </div>

            <!-- Forgot Password Link -->
            <div class="text-right">
              <Button
                variant="link"
                class="px-0 text-sm"
                @click="handleForgotPassword"
                type="button"
              >
                Forgot your password?
              </Button>
            </div>

            <!-- Login Button -->
            <Button
              type="submit"
              class="w-full"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Signing in...' : 'Sign in' }}
            </Button>

            <!-- Social Login -->
            <SocialLogin
              :redirectTo="redirectTo"
              :showDivider="true"
              buttonStyle="full"
              size="default"
            />
          </CardContent>

          <CardFooter v-if="showRegisterLink">
            <div class="text-center text-sm w-full">
              Don't have an account?
              <Button
                variant="link"
                class="px-1"
                @click="router.push('/register')"
                type="button"
              >
                Create an account
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  </div>
</template>
