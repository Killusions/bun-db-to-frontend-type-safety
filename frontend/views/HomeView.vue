<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';

import { client, type Query } from '../client/client';
import { loggedIn } from '../client/auth';

const posts = ref<Query["posts"]["getPosts"]>([]);
const isLoading = ref(true);
const users = ref(new Map<string, Query["getUserInfo"]>());

onMounted(async () => {
  try {
    posts.value = loggedIn.value
      ? await client.posts.getPosts.query(undefined)
      : await client.posts.getPosts.query(undefined);

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
});

const formatDate = (dateString: Date | string): string => {
  return new Date(dateString).toLocaleDateString();
};

const getUserName = (userId: string): string => {
  return users.value.get(userId)?.name || 'Unknown User';
};
</script>

<style scoped>
#login-button {
  inline-size: 100px;
  margin: 10px 0;
  padding: 10px 20px;
  background-color: #333333;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
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

<template>
  <div>
    <RouterLink v-if="!loggedIn" to="/login">
      <button type="button" id="login-button">Login</button>
    </RouterLink>

    <div v-if="isLoading" class="loading">Loading...</div>

    <div v-else class="posts">
      <div v-for="post in posts" :key="post.id" class="post">
        <h2>{{ post.title }}</h2>
        <p>{{ post.body }}</p>
        <small>By {{ getUserName(post.ownerId) }} on {{ formatDate(post.createdAt) }}</small>
      </div>

      <div v-if="posts.length === 0">
        No posts available.
      </div>
    </div>
  </div>
</template>
