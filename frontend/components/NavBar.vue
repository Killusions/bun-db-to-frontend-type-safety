<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { useSession, signOut, isAdmin } from '../client/auth';
import { ref } from 'vue';

const router = useRouter();
const isMenuOpen = ref(false);
const session = useSession();

// Local computed values for better performance
const isAdminUser = isAdmin();

const handleLogout = async () => {
  try {
    const { error } = await signOut();
    if (error) {
      console.error('Logout failed:', error.message);
    } else {
      router.push('/login');
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};
</script>

<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-logo" @click="router.push('/')">
        Simple Server
      </div>

      <div class="navbar-menu-toggle" @click="toggleMenu">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>

      <ul class="navbar-links" :class="{ 'active': isMenuOpen }">
        <li @click="closeMenu">
          <a @click.prevent="router.push('/')" href="/">Home</a>
        </li>

        <template v-if="session.data?.user">
          <li @click="closeMenu">
            <a @click.prevent="router.push('/profile')" href="/profile">Profile</a>
          </li>
          <li v-if="isAdminUser" @click="closeMenu">
            <a @click.prevent="router.push('/admin')" href="/admin" class="admin-link">Admin</a>
          </li>
          <li @click="closeMenu">
            <a href="#" @click.prevent="handleLogout">Logout</a>
          </li>
          <li class="user-greeting" @click="closeMenu">
            Hello, {{ session.data?.user?.name || 'User' }}
          </li>
        </template>

        <template v-else>
          <li @click="closeMenu">
            <a @click.prevent="router.push('/login')" href="/login">Login</a>
          </li>
          <li @click="closeMenu">
            <a @click.prevent="router.push('/register')" href="/register">Register</a>
          </li>
        </template>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: #333;
  color: white;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.navbar-logo {
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
}

.navbar-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar-links li {
  margin-left: 20px;
}

.navbar-links a {
  color: white;
  text-decoration: none;
  font-size: 16px;
  transition: color 0.3s;
  cursor: pointer;
}

.navbar-links a:hover {
  color: #ccc;
}

.admin-link {
  color: #ffd700 !important;
}

.user-greeting {
  margin-left: 20px;
  font-size: 14px;
  opacity: 0.8;
}

.navbar-menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
}

.navbar-menu-toggle .bar {
  width: 25px;
  height: 3px;
  background-color: white;
  margin: 3px 0;
  transition: 0.4s;
}

@media screen and (max-width: 768px) {
  .navbar-menu-toggle {
    display: flex;
  }

  .navbar-links {
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    flex-direction: column;
    background-color: #333;
    align-items: center;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.5s ease;
  }

  .navbar-links.active {
    max-height: 500px;
    padding: 10px 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .navbar-links li {
    margin: 10px 0;
  }

  .user-greeting {
    margin: 10px 0;
  }
}
</style>