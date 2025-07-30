import { serve } from 'bun';

import Frontend from './frontend/index.html';
import Backend from './backend/router';
import { seedAccountAndPosts } from './backend/dev/seed';
import { migrate } from './backend/dev/migrate';

const PORT = process.env.PORT || 3000;
const BACKEND_HOST = process.env.BACKEND_HOST || 'localhost';
const BACKEND_PROTOCOL = process.env.BACKEND_PROTOCOL || 'http';

// Combined dev server, use backend/index.ts and frontend/index.html for development.

// Run db migrations
await migrate();

// Seed the database
await seedAccountAndPosts();

serve({
  ...Backend,
  port: PORT,
  routes: {
    '/': Frontend,
  },
  hostname: BACKEND_HOST
});

console.log(`Server running at ${BACKEND_PROTOCOL}://${BACKEND_HOST}:${PORT} with hot reload for both frontend and backend.`);
