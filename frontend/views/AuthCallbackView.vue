<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSession } from '../client/auth';

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
  <div class="callback-container">
    <div class="callback-card">
      <!-- Processing state -->
      <div v-if="isProcessing && !error" class="callback-content">
        <div class="loading-spinner"></div>
        <div class="callback-header">
          <h2>{{ message }}</h2>
          <p>Please wait while we complete your authentication.</p>
        </div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      </div>

      <!-- Success state -->
      <div v-else-if="!error && !isProcessing" class="callback-content">
        <div class="status-icon success-icon">✅</div>
        <div class="callback-header">
          <h2>Authentication Successful!</h2>
          <p>{{ message }}</p>
        </div>
        <div class="success-message">
          You will be redirected automatically in a moment.
        </div>
      </div>

      <!-- Error state -->
      <div v-else class="callback-content">
        <div class="status-icon error-icon">❌</div>
        <div class="callback-header">
          <h2>Authentication Failed</h2>
          <p>{{ message }}</p>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="action-buttons">
          <button 
            type="button" 
            class="primary-button"
            @click="handleRetry"
          >
            Try Again
          </button>
          
          <button 
            type="button" 
            class="secondary-button"
            @click="handleGoHome"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.callback-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.callback-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
  padding: 40px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.status-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.processing-icon {
  color: #6b7280;
}

.success-icon {
  color: #10b981;
}

.error-icon {
  color: #ef4444;
}

.callback-header h2 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.callback-header p {
  margin: 0 0 32px 0;
  color: #666;
  font-size: 16px;
  line-height: 1.5;
}

.loading-spinner {
  display: inline-block;
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-radius: 50%;
  border-top-color: #6b7280;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 24px;
}

.error-message {
  background-color: #fef2f2;
  border: 1px solid #f87171;
  color: #dc2626;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 1.5;
}

.success-message {
  background-color: #f0f9ff;
  border: 1px solid #0ea5e9;
  color: #0369a1;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 300px;
}

.primary-button {
  width: 100%;
  padding: 14px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.primary-button:hover {
  background-color: #555;
}

.secondary-button {
  width: 100%;
  padding: 14px;
  background-color: transparent;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

.secondary-button:hover {
  background-color: #f9f9f9;
  border-color: #333;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 24px;
}

.progress-fill {
  height: 100%;
  background-color: #10b981;
  animation: progress 2s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes progress {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}

/* Responsive design */
@media (max-width: 640px) {
  .callback-card {
    padding: 30px 20px;
  }
  
  .callback-header h2 {
    font-size: 20px;
  }
  
  .status-icon {
    font-size: 48px;
  }
}
</style>