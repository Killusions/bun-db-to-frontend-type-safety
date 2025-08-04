<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { RouterLink } from 'vue-router';

import { client, type Query } from '../client/client';
import { useSession, sessionPending } from '../client/auth';

const posts = ref<Query["posts"]["getPosts"]>([]);
const isLoading = ref(true);
const users = ref(new Map<string, Query["getUserInfo"]>());
const session = useSession();

// Computed values
const currentUser = computed(() => session.value?.data?.user);

onMounted(async () => {
  watch(sessionPending(), async (pending) => {
    if (!pending) {
      try {
        posts.value = currentUser.value
          ? await client.posts.getPosts.query(undefined)
          : await client.posts.getPublicPosts.query(undefined);

        for (const post of posts.value) {
          if (!users.value.has(post.ownerId)) {
            const userInfo = await client.getUserInfo.query({ id: post.ownerId });
            users.value.set(post.ownerId, userInfo);
          }
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        isLoading.value = false;
      }
    }
  }, { immediate: true });
});

const formatDate = (dateString: Date | string): string => {
  return new Date(dateString).toLocaleDateString();
};

// Function that returns a computed value for each user name
const getUserName = (userId: string) => {
  return computed(() => users.value.get(userId)?.name || 'Unknown User');
};
</script>

<template>
  <div>
    <div class="welcome-banner">
      <h1>Welcome to Simple Server</h1>
      <p v-if="currentUser">Hello, {{ currentUser?.name || 'User' }}! View your posts below or create a new one.</p>
      <p v-else>This is a simple blog platform. Sign in to see more posts and create your own.</p>

      <div class="action-buttons">
        <RouterLink v-if="!currentUser" to="/login">
          <button class="btn btn-primary">Login</button>
        </RouterLink>
        <RouterLink v-if="!currentUser" to="/register">
          <button class="btn btn-secondary">Register</button>
        </RouterLink>
        <RouterLink v-if="currentUser" to="/profile">
          <button class="btn btn-primary">My Profile</button>
        </RouterLink>
      </div>
    </div>

    <div v-if="isLoading" class="loading">Loading posts...</div>

    <div v-else class="posts">
      <div v-for="post in posts" :key="post.id" class="post">
        <h2>{{ post.title }}</h2>
        <p>{{ post.body }}</p>
        <small>By {{ getUserName(post.ownerId).value }} on {{ formatDate(post.createdAt) }}</small>
      </div>

      <div v-if="posts.length === 0" class="post">
        <p>No posts available.</p>
        <p v-if="!currentUser">Login to see more posts and create your own.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-banner {
  background-color: #f0f0f0;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 5px;
  text-align: center;
}

.welcome-banner h1 {
  margin-top: 0;
  color: #333;
}

.action-buttons {
  margin: 15px 0;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #333;
  color: white;
}

.btn-primary:hover {
  background-color: #555;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #ccc;
}

.posts {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.post {
  margin: 10px;
  padding: 15px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.post h2 {
  margin-top: 0;
  color: #333;
}

.post small {
  color: #666;
  display: block;
  margin-top: 10px;
}

.loading {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #666;
}
</style>
