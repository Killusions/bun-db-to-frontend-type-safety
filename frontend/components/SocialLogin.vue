<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { authClient } from '../client/auth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  redirectTo?: string;
  showDivider?: boolean;
  buttonStyle?: 'full' | 'icon';
  size?: 'sm' | 'default' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  redirectTo: '/',
  showDivider: true,
  buttonStyle: 'full',
  size: 'default'
});

const socialProviders = ref<Array<{ id: string; name: string; url: string }>>([]);
const isLoadingProviders = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    // For now, we'll set up static providers based on what Better Auth supports
    // In a real implementation, this could be fetched from the server
    const providers = [];

    try {
      // Add GitHub if available
      if (process.env.GITHUB_CLIENT_ID) {
        providers.push({ id: 'github', name: 'GitHub', url: '/auth/sign-in/github' });
      }
    } catch {}

    // Add Google if available
    try {
      if (process.env.GOOGLE_CLIENT_ID) {
        providers.push({ id: 'google', name: 'Google', url: '/auth/sign-in/google' });
      }
    } catch {}

    socialProviders.value = providers;
  } catch (err) {
    console.error('Failed to load social providers:', err);
    error.value = 'Failed to load social login options';
  } finally {
    isLoadingProviders.value = false;
  }
});

const handleSocialLogin = async (providerId: string) => {
  const data = await authClient.signIn.social({
    provider: providerId,
    callbackURL: props.redirectTo,
  });

  if (data.error) {
    error.value = data.error.message || 'Social login failed. Please try again.';
    return;
  }
};

const getProviderIcon = (providerId: string): string => {
  switch (providerId.toLowerCase()) {
    case 'github':
      return '🐙';
    case 'google':
      return '🔍';
    case 'facebook':
      return '📘';
    case 'twitter':
      return '🐦';
    case 'linkedin':
      return '💼';
    case 'discord':
      return '🎮';
    default:
      return '🔐';
  }
};

const getProviderColors = (providerId: string) => {
  switch (providerId.toLowerCase()) {
    case 'github':
      return 'bg-[#24292e] hover:bg-[#1a1e22] text-white';
    case 'google':
      return 'bg-[#4285f4] hover:bg-[#3367d6] text-white';
    case 'facebook':
      return 'bg-[#1877f2] hover:bg-[#166fe5] text-white';
    case 'twitter':
      return 'bg-[#1da1f2] hover:bg-[#1991db] text-white';
    case 'linkedin':
      return 'bg-[#0077b5] hover:bg-[#005885] text-white';
    case 'discord':
      return 'bg-[#5865f2] hover:bg-[#4752c4] text-white';
    default:
      return 'bg-muted hover:bg-muted/80 text-muted-foreground';
  }
};
</script>

<template>
  <div class="w-full">
    <!-- Divider -->
    <div v-if="showDivider && socialProviders.length > 0" class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <Separator class="w-full" />
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-background px-2 text-muted-foreground">
          or continue with
        </span>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoadingProviders" class="flex items-center justify-center p-4 space-x-2">
      <Skeleton class="h-10 w-full" />
    </div>

    <!-- Error state -->
    <Alert v-else-if="error" variant="destructive">
      <AlertDescription>
        {{ error }}
      </AlertDescription>
    </Alert>

    <!-- Social providers -->
    <div
      v-else
      :class="buttonStyle === 'icon' ? 'grid grid-cols-2 gap-3 sm:grid-cols-3' : 'space-y-3'"
    >
      <Button
        v-for="provider in socialProviders"
        :key="provider.id"
        type="button"
        :size="size"
        :disabled="false"
        :class="[
          getProviderColors(provider.id),
          buttonStyle === 'icon' ? 'aspect-square' : 'w-full justify-start',
          'transition-transform hover:scale-105'
        ]"
        @click="handleSocialLogin(provider.id)"
      >
        <span class="text-lg mr-2">{{ getProviderIcon(provider.id) }}</span>
        <span v-if="buttonStyle === 'full'">
          Continue with {{ provider.name }}
        </span>
      </Button>
    </div>
  </div>
</template>
