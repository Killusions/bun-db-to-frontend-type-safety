# Agent Development Guide

This guide provides comprehensive information for AI agents and developers working on this full-stack TypeScript project. The project demonstrates a modern web application stack with type-safe API communication, database schema derivation, and comprehensive authentication.

## Project Overview

This is a full-stack application built with:
- **Runtime**: Bun (JavaScript runtime and package manager)
- **Backend**: tRPC + Drizzle ORM + PostgreSQL + Better Auth
- **Frontend**: Vue 3 + TypeScript + TailwindCSS + shadcn/ui components
- **Type Safety**: End-to-end type safety from database schema to frontend components

## Architecture

```
simple-server/
├── backend/                 # Server-side code
│   ├── auth/               # Authentication logic (Better Auth)
│   ├── db/                 # Database schema and configuration
│   ├── posts/              # Posts feature router
│   ├── dev/                # Development utilities
│   ├── index.ts            # Standalone backend server
│   └── router.ts           # Main tRPC router
├── frontend/               # Client-side Vue application
│   ├── client/             # tRPC client and auth setup
│   ├── components/         # Vue components
│   │   └── ui/             # shadcn/ui components
│   ├── views/              # Vue router views
│   ├── lib/                # Utility functions
│   └── assets/             # Static assets
├── package.json            # Dependencies and scripts
├── index.ts                # Combined dev server
└── README.md               # Project documentation
```

## Bun Commands and Scripts

### Core Commands

Install dependencies:
```bash
bun install
```

Start the development server (frontend + backend with hot reload):
```bash
bun run start
```

Build the project:
```bash
bun run build
```

### Database Commands

Run database migrations:
```bash
bun run migrate
```

Setup authentication (create admin user):
```bash
bun run auth:setup
```

### Available Scripts in package.json

- `start`: Runs the combined dev server with hot reload for both frontend and backend
- `build`: Compiles TypeScript and builds both backend and frontend for production
- `migrate`: Pushes database schema changes using Drizzle Kit
- `auth:setup`: Creates initial admin user and roles

### Direct Bun Usage

Run TypeScript files directly:
```bash
bun run --hot index.ts                    # Hot reload enabled
bun run backend/index.ts                  # Standalone backend
bun run frontend/dev/build.ts             # Frontend build script
```

## Database Schema and Drizzle

### Schema Files

- `backend/db/schema.ts`: Main application schema (posts, etc.)
- `backend/db/auth-schema.ts`: Better Auth required tables + custom role tables
- `backend/db/index.ts`: Database connection and exports
- `backend/db/drizzle.config.ts`: Drizzle configuration

### Type Derivation

Frontend types are automatically derived from the database schema using `drizzle-zod`:

```typescript
// In backend/posts/router.ts
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { tables } from '../db';

// These schemas are automatically type-safe
const insertPostSchema = createInsertSchema(tables.posts);
const selectPostSchema = createSelectSchema(tables.posts);

// Used in tRPC procedures for validation and type inference
export const postsRouter = router({
  createPost: protectedProcedure
    .input(insertPostSchema.omit({ id: true, ownerId: true, createdAt: true }))
    .output(selectPostSchema)
    .mutation(async ({ input, ctx }) => {
      // Implementation
    })
});
```

### Schema Definition Example

```typescript
// backend/db/schema.ts
export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: varchar('owner_id', { length: 255 }).notNull().references(() => user.id),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  isPrivate: boolean('is_private').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

## tRPC Setup and Usage

### Backend Router Structure

The main router (`backend/router.ts`) combines multiple feature routers:

```typescript
export const server = router({
  // Base procedures
  getUserInfo: publicProcedure.query(/* ... */),
  getUserByEmail: adminProcedure.query(/* ... */),
  
  // Feature routers
  posts: postsRouter,      // Posts CRUD operations
});

export type AppRouter = typeof server;
```

### Procedure Types

- `publicProcedure`: No authentication required
- `protectedProcedure`: Requires valid user session
- `adminProcedure`: Requires admin role
- `roleProtectedProcedure(roles)`: Requires specific role(s)

### Frontend tRPC Client

```typescript
// frontend/client/client.ts
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../backend/router';

export const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${BACKEND_PROTOCOL}://${BACKEND_HOST}:${PORT}/api`,
      transformer: superjson,
    }),
  ],
});

// Type inference for all API responses
export type Query = inferRouterOutputs<AppRouter>;
```

### Using tRPC in Vue Components

```typescript
// In Vue component
import { client, type Query } from '../client/client';

// Type-safe API calls
const posts = ref<Query["posts"]["getPosts"]>([]);

onMounted(async () => {
  // Fully typed API call
  posts.value = await client.posts.getPosts.query();
  
  // Create new post
  await client.posts.createPost.mutate({
    title: 'New Post',
    body: 'Post content',
    isPrivate: false
  });
});
```

## Authentication with Better Auth

### Configuration

Better Auth is configured in `backend/auth/auth.ts` with:

- Email/password authentication with verification
- Social login (GitHub, Google) - optional
- Role-based access control
- Session management
- Password reset functionality

### Custom Role System

The project extends Better Auth with a custom role system:

```typescript
// Custom tables in auth-schema.ts
export const role = pgTable('role', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 64 }).notNull().unique(),
  description: text('description'),
  // ...
});

export const userRole = pgTable('user_role', {
  userId: varchar('user_id', { length: 255 }).references(() => user.id),
  roleId: varchar('role_id', { length: 255 }).references(() => role.id),
  // ...
});
```

### Frontend Authentication

```typescript
// frontend/client/auth.ts
import { createAuthClient } from "better-auth/vue";

export const authClient = createAuthClient({
  baseURL: `${BACKEND_PROTOCOL}://${BACKEND_HOST}:${PORT}`
});

// Export the hooks and methods from the client
export const useSession = authClient.useSession;
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;

// Check if session was checked
export const sessionPending = () => {
  const session = useSession();
  return computed(() => !!session.value?.isPending);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const session = useSession();
  return computed(() => !!session.value?.data?.user);
};
```

If querying or having logic based on the user session, `watch` the `sessionPending` state to ensure the session is loaded before.

```typescript
import { watch } from 'vue';
import { sessionPending } from '../client/auth';

watch(sessionPending(), async (pending) => {
  if (!pending) {
    ...
  }
}, { immediate: true });
```

## Vue Frontend Setup

### Project Structure

- `frontend/main.ts`: Vue app entry point
- `frontend/App.vue`: Root component
- `frontend/router.ts`: Vue Router configuration
- `frontend/views/`: Page components
- `frontend/components/`: Reusable components

### TypeScript Configuration

The frontend uses TypeScript with strict type checking. Key configuration:

```json
// frontend/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": {
      "@/*": ["./frontend/*"]
    }
  }
}
```

### Component Example with tRPC and Better Auth

```vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { client, type Query } from '../client/client';
import { useSession } from '../client/auth';

// Type-safe reactive data
const posts = ref<Query["posts"]["getPosts"]>([]);
const isLoading = ref(true);
const session = useSession();

onMounted(async () => {
  try {
    // Use authenticated or public endpoint based on session
    posts.value = session.value?.user
      ? await client.posts.getPosts.query()
      : await client.posts.getPublicPosts.query();
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  } finally {
    isLoading.value = false;
  }
});

const createPost = async (title: string, body: string) => {
  const newPost = await client.posts.createPost.mutate({
    title,
    body,
    isPrivate: false
  });
  posts.value.push(newPost);
};
</script>
```

## TailwindCSS and shadcn/ui Components

### TailwindCSS Configuration

TailwindCSS is configured in `frontend/tailwind.config.js` with:

- Custom color schemes
- Animation utilities
- Responsive design utilities
- Component-specific styles

### shadcn/ui Integration

Components are located in `frontend/components/ui/` and configured via `frontend/components.json`:

```json
{
  "style": "new-york",
  "typescript": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "./index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib"
  }
}
```

### Available UI Components

The project includes these shadcn/ui components:
- `Button` - Interactive buttons with variants
- `Card` - Content containers with header/content structure
- `Input` - Form input fields
- `Dialog` - Modal dialogs
- `Avatar` - User profile pictures/initials
- `Badge` - Status indicators
- `Skeleton` - Loading placeholders
- And many more in `frontend/components/ui/`

Prefer using (and sometimes customizing) these components for consistent UI/UX across the application.
If you want to create new components, try to copy on of the existing vue shadcn/ui components into the folder, otherwise, follow the shadcn/ui patterns and use TailwindCSS for styling. Use `reka-ui` instead of `radix-vue` (types work better).

### Using Components

```vue
<script setup>
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Create Post</CardTitle>
    </CardHeader>
    <CardContent>
      <Input v-model="title" placeholder="Post title" />
      <Button @click="submitPost" class="mt-4">
        Create Post
      </Button>
    </CardContent>
  </Card>
</template>
```

### Modifying Components

When you need to customize shadcn/ui components:

1. Copy the component from `frontend/components/ui/`
2. Modify the component as needed
3. Update imports if creating variants
4. Follow TailwindCSS patterns for styling

Example customization:
```vue
<!-- Custom button variant -->
<script setup>
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'custom';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default'
});
</script>

<template>
  <Button 
    :class="cn(
      variant === 'custom' && 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
    )"
    v-bind="$attrs"
  >
    <slot />
  </Button>
</template>
```

## Development Guidelines

### File Organization

- Keep related functionality grouped (auth/, posts/, etc.)
- Use barrel exports in index.ts files
- Follow Vue 3 Composition API patterns
- Leverage TypeScript for type safety

### Type Safety Best Practices

1. **Always derive types from the database schema** using drizzle-zod
2. **Use tRPC's type inference** for API calls
3. **Define component props with TypeScript interfaces**
4. **Leverage Vue's `defineProps<T>()`** for component typing

### Adding New Features

1. **Create database schema** in `backend/db/schema.ts`
2. **Run migrations** with `bun run migrate`
3. **Create tRPC router** in `backend/[feature]/router.ts`
4. **Add to main router** in `backend/router.ts`
5. **Create Vue components** using the tRPC client
6. **Add routes** to `frontend/router.ts`

### Environment Setup

Required environment variables:

```env
# Database
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/server-db

# Server
PORT=3000
BACKEND_HOST=localhost
BACKEND_PROTOCOL=http

# Authentication
BETTER_AUTH_SECRET=your_random_secret_here
BETTER_AUTH_URL=http://localhost:3000

# Optional: Social Login
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Common Patterns

### Creating a New tRPC Procedure

```typescript
// backend/[feature]/router.ts
export const featureRouter = router({
  createItem: protectedProcedure
    .input(createInsertSchema(tables.items).omit({ id: true, userId: true }))
    .output(createSelectSchema(tables.items))
    .meta({ openapi: { method: 'POST', path: '/items' } })
    .mutation(async ({ input, ctx }) => {
      const item = await db.insert(tables.items)
        .values({ ...input, userId: ctx.session.userId })
        .returning();
      return item[0];
    }),
});
```

### Vue Component with tRPC and Better Auth

```vue
<script lang="ts" setup>
import { ref } from 'vue';
import { client } from '@/client/client';
import { useSession, signIn } from '@/client/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/sonner';

const { toast } = useToast();
const session = useSession();
const isLoading = ref(false);

const handleAction = async () => {
  isLoading.value = true;
  try {
    await client.feature.action.mutate(data);
    toast.success('Action completed successfully');
  } catch (error) {
    toast.error('Failed to complete action');
  } finally {
    isLoading.value = false;
  }
};

const handleLogin = async (email: string, password: string) => {
  const { error } = await signIn.email({ email, password });
  if (error) {
    toast.error(error.message);
  } else {
    toast.success('Login successful');
  }
};
</script>
```

This guide should provide everything needed to understand and extend this full-stack TypeScript application. The architecture prioritizes type safety, developer experience, and maintainability while using modern web development tools and patterns.

## Important instructions

Never use the Typescript any type, if you really have to (like for catching errors), use unknown.

Use drizzle for all DB migrations and management.
