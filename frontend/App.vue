<script lang="ts" setup>
import { computed } from 'vue';
import { RouterView } from 'vue-router';
import NavBar from './components/NavBar.vue';
import { useSession } from './client/auth';

const session = useSession();

// Computed values
const currentUser = computed(() => session.value?.data?.user);
const userLogMessage = computed(() => 
  currentUser.value ? `Current user: ${currentUser.value.name}` : 'No user logged in'
);

console.log('Hello, frontend!');
console.log(userLogMessage.value);
</script>

<template>
  <div id="app-shell" class="min-h-screen bg-background font-sans antialiased">
    <NavBar />
    <RouterView />
  </div>
</template>

<style>
html, body, #app, #app-shell {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    "Noto Sans",
    sans-serif,
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "Noto Color Emoji";
}
</style>
