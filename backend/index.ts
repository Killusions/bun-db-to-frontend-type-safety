// Runs the backend server standalone.

import { serve } from 'bun';

import Backend from './router';

const PORT = process.env.PORT || 3000;

serve({
  ...Backend,
  port: PORT,
});

console.log(`Server running on port ${PORT}.`);
