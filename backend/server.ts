import { createBunServeHandler } from 'trpc-bun-adapter';
import { eq, or, and } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

import { db, tables } from './db';
import { createContext } from './auth/context';
import { router, publicProcedure, protectedProcedure } from './auth/middleware';
import { authRouter } from './auth/router';

const createPostSchema = createInsertSchema(tables.posts).omit({ id: true });

export const createPost = async (input: ReturnType<typeof createPostSchema.parse>) => {
  const post = await db.insert(tables.posts).values(input).returning();
  if (post.length === 0 || !post[0]) {
    throw new Error('Failed to create post');
  }
  return createSelectSchema(tables.posts).parse(post[0]);
};

const baseRouter = router({
  ping: publicProcedure.query(() => 'pong'),
  getPublicPosts: publicProcedure.query(async () => {
    const posts = await db.select().from(tables.posts).where(eq(tables.posts.isPrivate, false));
    if (posts.length === 0) {
      return [];
    }
    return posts.map(post => createSelectSchema(tables.posts).parse(post));
  }),
  getPosts: protectedProcedure.query(async({ ctx: { session } }) => {
    const posts = await db.select().from(tables.posts).where(or(eq(tables.posts.isPrivate, false), eq(tables.posts.ownerId, session!.userId)));
    if (posts.length === 0) {
      return [];
    }
    return posts.map(post => createSelectSchema(tables.posts).parse(post));
  }),
  createPost: protectedProcedure
    .input(createPostSchema.omit({ ownerId: true, createdAt: true }))
    .mutation(async ({ input, ctx: { session } }) => {
      return await createPost({ ...input, ownerId: session!.userId });
    }),
  updatePost: protectedProcedure
    .input(createUpdateSchema(tables.posts).required({ id: true }).omit({ ownerId: true }))
    .mutation(async ({ input, ctx: { session } }) => {
      const updatedPost = await db.update(tables.posts).set(input).where(and(eq(tables.posts.id, input.id), eq(tables.posts.ownerId, session!.userId))).returning();
      if (updatedPost.length === 0 || !updatedPost[0]) {
        throw new Error('Failed to update post');
      }
      return createSelectSchema(tables.posts).parse(updatedPost[0]);
    }),
  deletePost: protectedProcedure
    .input(createSelectSchema(tables.posts).pick({ id: true }))
    .mutation(async ({ input, ctx: { session } }) => {
      const deletedPost = await db.delete(tables.posts).where(and(eq(tables.posts.id, input.id), eq(tables.posts.ownerId, session!.userId))).returning();
      if (deletedPost.length === 0 || !deletedPost[0]) {
        throw new Error('Failed to delete post');
      }
    }),
  getUserInfo: publicProcedure.input(createSelectSchema(tables.users).pick({ id: true })).query(async ({ input }) => {
    const user = await db.query.users.findFirst({ where: eq(tables.users.id, input.id), columns: { name: true, id: true } });
    if (!user) {
      throw new Error('User not found');
    }
    return createSelectSchema(tables.users).omit({ email: true, createdAt: true, hashedPassword: true }).parse(user);
  })
});

export const server = router({
  ...baseRouter._def.procedures,
  auth: authRouter,
});

export type AppRouter = typeof server;

export default createBunServeHandler({ router: server, endpoint: '/api', createContext }, { fetch: () => new Response('Not Found', { status: 404 }) });
