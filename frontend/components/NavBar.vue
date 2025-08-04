<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSession, signOut, isAdmin } from '../client/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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

const getInitials = (name: string) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
};
</script>

<template>
  <nav class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-16 items-center">
      <!-- Logo -->
      <div class="mr-6">
        <Button
          variant="ghost"
          class="text-lg font-bold hover:bg-transparent p-0"
          @click="router.push('/')"
        >
          Simple Server
        </Button>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex flex-1 items-center space-x-6">
        <Button
          variant="ghost"
          class="text-sm font-medium"
          @click="router.push('/')"
        >
          Home
        </Button>
      </div>

      <!-- Right side - User menu / Auth buttons -->
      <div class="flex items-center space-x-4">
        <!-- Desktop Auth -->
        <div class="hidden md:flex items-center space-x-4">
          <template v-if="session.data?.user">
            <!-- Admin Badge -->
            <Badge v-if="isAdminUser" variant="secondary" class="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Admin
            </Badge>

            <!-- User Dropdown -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" class="relative h-8 w-8 rounded-full">
                  <Avatar class="h-8 w-8">
                    <AvatarFallback>{{ getInitials(session.data?.user?.name || 'User') }}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-56" align="end">
                <div class="flex items-center justify-start gap-2 p-2">
                  <div class="flex flex-col space-y-1 leading-none">
                    <p class="font-medium">{{ session.data?.user?.name || 'User' }}</p>
                    <p class="w-[200px] truncate text-sm text-muted-foreground">
                      {{ session.data?.user?.email }}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="router.push('/profile')">
                  Profile
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem @click="handleLogout">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </template>

          <template v-else>
            <Button variant="ghost" @click="router.push('/login')">
              Login
            </Button>
            <Button @click="router.push('/register')">
              Register
            </Button>
          </template>
        </div>

        <!-- Mobile Menu -->
        <div class="md:hidden">
          <Sheet v-model:open="isMenuOpen">
            <SheetTrigger as-child>
              <Button variant="ghost" size="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-6 w-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" class="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              <div class="grid gap-4 py-4">
                <!-- Mobile Navigation Links -->
                <Button
                  variant="ghost"
                  class="justify-start"
                  @click="router.push('/'); isMenuOpen = false"
                >
                  Home
                </Button>

                <template v-if="session.data?.user">
                  <div class="flex items-center space-x-2 px-4 py-2">
                    <Avatar class="h-8 w-8">
                      <AvatarFallback>{{ getInitials(session.data?.user?.name || 'User') }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p class="text-sm font-medium">{{ session.data?.user?.name || 'User' }}</p>
                      <p class="text-xs text-muted-foreground">{{ session.data?.user?.email }}</p>
                    </div>
                    <Badge v-if="isAdminUser" variant="secondary" class="ml-auto">Admin</Badge>
                  </div>

                  <Button
                    variant="ghost"
                    class="justify-start"
                    @click="router.push('/profile'); isMenuOpen = false"
                  >
                    Profile
                  </Button>

                  <Button
                    variant="ghost"
                    class="justify-start text-red-600"
                    @click="handleLogout(); isMenuOpen = false"
                  >
                    Logout
                  </Button>
                </template>

                <template v-else>
                  <Button
                    variant="ghost"
                    class="justify-start"
                    @click="router.push('/login'); isMenuOpen = false"
                  >
                    Login
                  </Button>
                  <Button
                    class="justify-start"
                    @click="router.push('/register'); isMenuOpen = false"
                  >
                    Register
                  </Button>
                </template>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  </nav>
</template>
