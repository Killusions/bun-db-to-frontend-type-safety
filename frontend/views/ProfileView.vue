<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSession, signOut, isAdmin } from '../client/auth';

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
</script>

<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1 class="page-title">Profile</h1>
      <div v-if="isAdminUser">
        <span class="admin-badge">Admin</span>
      </div>
    </div>

    <div v-if="currentUser" class="user-card">
      <div class="user-header">
        <div class="user-avatar">
          {{ (currentUser && currentUser.name && currentUser.name.length > 0) ? currentUser.name[0]?.toUpperCase() : 'U' }}
        </div>
        <div class="user-info">
          <h2 class="user-name">{{ currentUser && currentUser.name || 'User' }}</h2>
          <p class="user-email">{{ currentUser && currentUser.email }}</p>
          <div class="user-roles">
            <span
              v-if="isAdminUser"
              class="role-badge admin"
            >
              admin
            </span>
          </div>
        </div>
      </div>

      <h3 class="section-title">Account Details</h3>
      <div class="details-grid">
        <div class="detail-item">
          <div class="detail-label">User ID</div>
          <div class="detail-value">{{ currentUser && currentUser.id }}</div>
        </div>
        <div class="detail-item" v-if="currentUser && currentUser.createdAt">
          <div class="detail-label">Member Since</div>
          <div class="detail-value">{{ formatDate(currentUser.createdAt) }}</div>
        </div>
      </div>

      <div class="actions">
        <button @click="handleLogout" :disabled="isLoading">
          {{ isLoading ? 'Logging out...' : 'Logout' }}
        </button>
        <button class="secondary" @click="router.push('/')">
          Back to Home
        </button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </div>

    <div v-else-if="!currentUser">
      <p>Please log in to view your profile.</p>
      <button @click="router.push('/login?redirect=/profile')">
        Go to Login
      </button>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.user-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 30px;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #333;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-right: 20px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 5px 0;
}

.user-email {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.user-roles {
  margin-top: 8px;
}

.role-badge {
  display: inline-block;
  background-color: #eee;
  color: #333;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 5px;
}

.role-badge.admin {
  background-color: #ffd700;
  color: #333;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  margin: 25px 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.detail-value {
  font-size: 14px;
  color: #333;
}

.actions {
  margin-top: 30px;
}

button {
  padding: 10px 16px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 10px;
}

button.secondary {
  background-color: #e0e0e0;
  color: #333;
}

button:hover {
  opacity: 0.9;
}

button:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 15px;
}

.success-message {
  color: #2ecc71;
  font-size: 14px;
  margin-top: 15px;
}

.admin-badge {
  background-color: #ffd700;
  color: #333;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  margin-left: 10px;
}
</style>