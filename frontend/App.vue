<script lang="ts" setup>
import { RouterView } from 'vue-router';
import { user } from './client/auth';

console.log('Hello, frontend!');

console.log(user.value ? 'Current user: ' + user.value.name : 'No user logged in');
</script>

<template>
  <div id="app-shell" class="min-h-screen bg-background font-sans antialiased">
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
