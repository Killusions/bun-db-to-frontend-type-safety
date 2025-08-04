# Bun DB to frontend type-safety (with Better Auth)

Example project combining bun's full-stack dev server with tRPC and drizzle, deriving frontend types from the DB schema.
Features a complete authentication system powered by Better Auth with email verification, password reset, social login (SSO), and role-based access control, OpenAPI-compatible endpoints and a Vue frontend integrated as a bun plugin (works for bundler and dev server), including Tailwind CSS.

To install dependencies:

```bash
bun install
```

**Set up Postgres locally and create a .env file with the following variables:**

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

# Social Login (Optional - only set if you want to enable SSO)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Production (Optional)
PRODUCTION_URL=https://yourdomain.com
COOKIE_DOMAIN=yourdomain.com
```

## Running the application

```bash
bun run start
```

The application will be available at http://localhost:3000 (or your configured host/port).

This project was created using `bun init` in bun v1.2.19. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
