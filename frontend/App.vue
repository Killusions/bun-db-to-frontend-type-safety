<script lang="ts" setup>
import { RouterView } from 'vue-router';
import { user } from './client/auth';

console.log('Hello, frontend!');

console.log(user.value ? 'Current user: ' + user.value.name : 'No user logged in');
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Roboto', sans-serif;
}

#app {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}
</style>

<template>
  <RouterView />
</template>
