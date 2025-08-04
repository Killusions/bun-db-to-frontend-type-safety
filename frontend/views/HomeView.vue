<script lang="ts" setup>
import { ref, computed, onMounted, watch, type ComputedRef } from 'vue';
import { RouterLink } from 'vue-router';
import { client, type Query } from '../client/client';
import { useSession, sessionPending } from '../client/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

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

// Function that receives a ref and returns a computed value for getting initials
const getInitials = (nameRef: ComputedRef<string>) => {
  return computed(() => nameRef.value?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U');
};


</script>

<template>
  <div class="flex flex-col flex-1 flex-grow overflow-auto bg-gray-50">
    <div class="flex-1 flex-grow container mx-auto px-4 py-8">
      <!-- Welcome Banner -->
      <Card class="mb-8">
        <CardHeader class="text-center">
          <CardTitle class="text-3xl font-bold text-gray-900">
            Welcome to Simple Server
          </CardTitle>
          <CardDescription class="text-lg mt-2">
            <span v-if="session.data?.user">
              Hello, {{ session.data?.user?.name || 'User' }}! View your posts below or create a new one.
            </span>
            <span v-else>
              This is a simple blog platform. Sign in to see more posts and create your own.
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div class="flex justify-center gap-4">
            <template v-if="!session.data?.user">
              <Button asChild>
                <RouterLink to="/login">Login</RouterLink>
              </Button>
              <Button variant="outline" asChild>
                <RouterLink to="/register">Register</RouterLink>
              </Button>
            </template>
            <template v-else>
              <Button asChild>
                <RouterLink to="/profile">My Profile</RouterLink>
              </Button>
            </template>
          </div>
        </CardContent>
      </Card>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-4">
        <div class="text-center text-muted-foreground mb-6">Loading posts...</div>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card v-for="n in 6" :key="n">
            <CardHeader>
              <Skeleton class="h-6 w-3/4" />
              <Skeleton class="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton class="h-4 w-full mb-2" />
              <Skeleton class="h-4 w-full mb-2" />
              <Skeleton class="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Posts -->
      <div v-else>
        <h2 class="text-2xl font-semibold text-gray-900 mb-6">Recent Posts</h2>

        <div v-if="posts.length === 0" class="text-center py-12">
          <Card class="max-w-md mx-auto">
            <CardContent class="pt-6">
              <div class="text-6xl text-gray-300 mb-4">📝</div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No posts available</h3>
              <p class="text-gray-600 mb-4">
                <span v-if="!session.data?.user">
                  Login to see more posts and create your own.
                </span>
                <span v-else>
                  Be the first to create a post!
                </span>
              </p>
              <Button v-if="!session.data?.user" asChild>
                <RouterLink to="/login">Get Started</RouterLink>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card v-for="post in posts" :key="post.id" class="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle class="text-xl text-gray-900 overflow-hidden">
                {{ post.title }}
              </CardTitle>
              <div class="flex items-center space-x-3 mt-3">
                <Avatar class="h-8 w-8">
                  <AvatarFallback class="text-xs">
                    {{ getInitials(getUserName(post.ownerId)) }}
                  </AvatarFallback>
                </Avatar>
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900">
                    {{ getUserName(post.ownerId).value }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ formatDate(post.createdAt) }}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p class="text-gray-700 overflow-hidden leading-relaxed">
                {{ post.body }}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
