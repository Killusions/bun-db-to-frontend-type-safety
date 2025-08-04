<script lang="ts" setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSession, signUp } from '../client/auth';
import SocialLogin from '../components/SocialLogin.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  <div class="flex-1 flex-grow overflow-auto flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <Card>
        <CardHeader class="space-y-1">
          <CardTitle class="text-2xl font-bold">Create your account</CardTitle>
          <CardDescription>
            Enter your information to create a new account
          </CardDescription>
        </CardHeader>

        <form @submit.prevent="handleSubmit">
          <CardContent class="space-y-4">
            <!-- Error Alert -->
            <Alert v-if="error" variant="destructive">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>

            <!-- Success Alert -->
            <Alert v-if="successMessage" variant="default">
              <AlertDescription>{{ successMessage }}</AlertDescription>
            </Alert>

            <!-- Name Field -->
            <div class="space-y-2">
              <Label for="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                v-model="form.name"
                :disabled="isLoading"
                required
              />
            </div>

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

            <!-- Confirm Password Field -->
            <div class="space-y-2">
              <Label for="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                v-model="form.confirmPassword"
                :disabled="isLoading"
                required
              />
            </div>

            <!-- Register Button -->
            <Button
              type="submit"
              class="w-full"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Creating account...' : 'Create account' }}
            </Button>

            <!-- Social Login -->
            <SocialLogin
              redirectTo="/"
              :showDivider="true"
              buttonStyle="full"
              size="default"
            />
          </CardContent>

          <CardFooter>
            <div class="text-center text-sm w-full">
              Already have an account?
              <Button
                variant="link"
                class="px-1"
                @click="router.push('/login')"
                type="button"
              >
                Sign in
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  </div>
</template>
