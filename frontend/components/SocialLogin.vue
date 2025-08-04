<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { authClient } from '../client/auth';

interface Props {
  redirectTo?: string;
  showDivider?: boolean;
  buttonStyle?: 'full' | 'icon';
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  redirectTo: '/',
  showDivider: true,
  buttonStyle: 'full',
  size: 'medium'
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
      return {
        bg: '#24292e',
        hover: '#1a1e22',
        text: '#ffffff'
      };
    case 'google':
      return {
        bg: '#4285f4',
        hover: '#3367d6',
        text: '#ffffff'
      };
    case 'facebook':
      return {
        bg: '#1877f2',
        hover: '#166fe5',
        text: '#ffffff'
      };
    case 'twitter':
      return {
        bg: '#1da1f2',
        hover: '#1991db',
        text: '#ffffff'
      };
    case 'linkedin':
      return {
        bg: '#0077b5',
        hover: '#005885',
        text: '#ffffff'
      };
    case 'discord':
      return {
        bg: '#5865f2',
        hover: '#4752c4',
        text: '#ffffff'
      };
    default:
      return {
        bg: '#6b7280',
        hover: '#4b5563',
        text: '#ffffff'
      };
  }
};

const setProviderColors = (target: EventTarget | null, providerId: string, type: 'hover' | 'default' = 'default') => {
  const colors = getProviderColors(providerId);
  (target as HTMLElement).style.backgroundColor = colors[type === 'hover' ? 'hover' : 'bg'];
};
</script>

<template>
  <div class="social-login-container">
    <!-- Divider -->
    <div v-if="showDivider && socialProviders.length > 0" class="divider">
      <span>or continue with</span>
    </div>

    <!-- Loading state -->
    <div v-if="isLoadingProviders" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Loading social login options...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <!-- No providers available -->
    <div v-else-if="socialProviders.length === 0" class="no-providers">
      No social login providers configured
    </div>

    <!-- Social providers -->
    <div v-else :class="buttonStyle === 'icon' ? 'providers-grid' : 'providers-list'">
      <button
        v-for="provider in socialProviders"
        :key="provider.id"
        type="button"
        class="social-button"
        :class="[
          size,
          { 'icon-only': buttonStyle === 'icon' }
        ]"
        :style="{
          backgroundColor: getProviderColors(provider.id).bg,
          color: getProviderColors(provider.id).text
        }"
        :disabled="isLoadingProviders"
        @click="handleSocialLogin(provider.id)"
        @mouseover="(e) => setProviderColors(e.target, provider.id, 'hover')"
        @mouseleave="(e) => setProviderColors(e.target, provider.id, 'default')"
      >
        <div class="button-content">
          <span class="provider-icon">{{ getProviderIcon(provider.id) }}</span>
          <span v-if="buttonStyle === 'full'" class="provider-name">
            {{ provider.name }}
          </span>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.social-login-container {
  width: 100%;
}

.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
  color: #6b7280;
  font-size: 14px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e5e7eb;
}

.divider span {
  padding: 0 16px;
  background-color: white;
}

.providers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.providers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 12px;
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.social-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.social-button:active {
  transform: translateY(0);
}

.social-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Size variants */
.social-button.small {
  padding: 8px 12px;
  font-size: 14px;
}

.social-button.medium {
  padding: 12px 16px;
  font-size: 16px;
}

.social-button.large {
  padding: 16px 20px;
  font-size: 18px;
}

/* Icon-only style */
.social-button.icon-only {
  aspect-ratio: 1;
  padding: 12px;
}

.social-button.icon-only.small {
  padding: 8px;
}

.social-button.icon-only.large {
  padding: 16px;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.provider-icon {
  font-size: 1.2em;
  line-height: 1;
}

.provider-name {
  font-weight: 500;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #6b7280;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  border-top-color: #6b7280;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

.error-state {
  padding: 12px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 14px;
  text-align: center;
}

.no-providers {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  padding: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive design */
@media (max-width: 640px) {
  .divider {
    margin: 20px 0;
  }

  .providers-grid {
    grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
    gap: 8px;
  }

  .social-button {
    font-size: 14px;
  }

  .social-button.large {
    padding: 14px 18px;
    font-size: 16px;
  }
}
</style>