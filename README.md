# Bun DB to frontend type-safety

Example project combining bun's full-stack dev server with tRPC and drizzle, deriving frontend types from the DB schema.
Includes an example start of an auth solution.

To install dependencies:

```bash
bun install
```

**Set up Postgres locally and create a .env file with the following variables:**

```env
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/server-db
PORT=3000
BACKEND_HOST=localhost
BACKEND_PROTOCOL=http
```

To run:

```bash
bun run start
```

This project was created using `bun init` in bun v1.2.19. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
