<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSession, signOut, isAdmin } from '../client/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const router = useRouter();
const isLoading = ref(false);
const error = ref('');
const successMessage = ref('');
const session = useSession();

// Computed values
const isAdminUser = isAdmin();

const handleLogout = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    const { error: authError } = await signOut();
    if (authError) {
      error.value = authError.message || 'Logout failed. Please try again.';
    } else {
      router.push('/login');
    }
  } catch (err) {
    error.value = 'Logout failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (date: Date | null | undefined): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getInitials = (name: string) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
};
</script>

<template>
  <div class="flex-1 flex-grow overflow-auto bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto space-y-8">
      <!-- Profile Header -->
      <Card>
        <CardHeader>
          <div class="flex items-center space-x-4">
            <Avatar class="h-16 w-16">
              <AvatarFallback class="text-lg">{{ getInitials(session.data?.user?.name || 'User') }}</AvatarFallback>
            </Avatar>
            <div class="flex-1">
              <CardTitle class="text-2xl">{{ session.data?.user?.name || 'User' }}</CardTitle>
              <CardDescription class="text-lg">{{ session.data?.user?.email }}</CardDescription>
              <div class="flex items-center space-x-2 mt-2">
                <Badge v-if="isAdminUser" variant="secondary" class="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Admin
                </Badge>
                <template v-for="role in (session.data?.roles || [])" :key="role">
                  <Badge v-if="role != 'admin'" variant="outline">
                    {{ role }}
                  </Badge>
                </template>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <!-- Account Information -->
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details and settings
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Alerts -->
          <Alert v-if="error" variant="destructive">
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>

          <Alert v-if="successMessage">
            <AlertDescription>{{ successMessage }}</AlertDescription>
          </Alert>

          <!-- User Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <h3 class="text-sm font-medium text-muted-foreground">Full Name</h3>
              <p class="text-sm">{{ session.data?.user?.name || 'Not provided' }}</p>
            </div>

            <div class="space-y-2">
              <h3 class="text-sm font-medium text-muted-foreground">Email Address</h3>
              <p class="text-sm">{{ session.data?.user?.email || 'Not provided' }}</p>
            </div>

            <div class="space-y-2">
              <h3 class="text-sm font-medium text-muted-foreground">Account Created</h3>
              <p class="text-sm">{{ formatDate(session.data?.user?.createdAt) }}</p>
            </div>

            <div class="space-y-2">
              <h3 class="text-sm font-medium text-muted-foreground">Account Status</h3>
              <Badge variant="default">Active</Badge>
            </div>
          </div>

          <Separator />

          <!-- Roles Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium">Roles & Permissions</h3>
            <div class="flex flex-wrap gap-2">
              <Badge v-if="isAdminUser" variant="secondary" class="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Administrator
              </Badge>
              <template v-for="role in (session.data?.roles || [])" :key="role">
                <Badge v-if="role != 'admin'" variant="outline">
                  {{ role }}
                </Badge>
              </template>
              <Badge v-if="!(session.data?.roles?.length) && !isAdminUser" variant="secondary">
                Standard User
              </Badge>
            </div>
          </div>

          <Separator />

          <!-- Actions -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium">Account Actions</h3>
            <div class="flex flex-col sm:flex-row gap-4">
              <Button
                variant="destructive"
                @click="handleLogout"
                :disabled="isLoading"
                class="flex-1"
              >
                {{ isLoading ? 'Signing out...' : 'Sign Out' }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
