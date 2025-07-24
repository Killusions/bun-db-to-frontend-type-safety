import z from 'zod';
import { eq, or, and, type SQL } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

import { db, tables } from '../db';
import { router, publicProcedure, protectedProcedure } from '../auth/middleware';

const getPosts = async (conditions: (SQL | undefined)[] = []) => {
  const posts = await db.query.posts.findMany({
    where: conditions ? and(...conditions) : undefined,
  });
  if (posts.length === 0) {
    return [];
  }
  return posts;
};

export const postsRouter = router({
  getPublicPosts: publicProcedure.input(z.void()).output(createSelectSchema(tables.posts).array()).query(async () => {
    return await getPosts([eq(tables.posts.isPrivate, false)]);
  }),
  getPosts: protectedProcedure.input(z.void()).output(createSelectSchema(tables.posts).array()).query(async({ ctx: { session } }) => {
    return await getPosts([
      or(eq(tables.posts.isPrivate, false), eq(tables.posts.ownerId, session.userId))
    ]);
  }),
  getUserPosts: protectedProcedure
    .input(createSelectSchema(tables.posts).pick({ ownerId: true }))
    .output(createSelectSchema(tables.posts).array())
    .query(async ({ input }) => {
      return await getPosts([and(eq(tables.posts.ownerId, input.ownerId), or(eq(tables.posts.isPrivate, false), eq(tables.posts.ownerId, input.ownerId)))]);
    }),
  createPost: protectedProcedure
    .input(createInsertSchema(tables.posts).omit({ id: true, ownerId: true, createdAt: true }))
    .output(createSelectSchema(tables.posts))
    .mutation(async ({ input, ctx: { session } }) => {
      const post = await db.insert(tables.posts).values({ ...input, ownerId: session.userId }).returning();
      if (post.length === 0 || !post[0]) {
        throw new Error('Failed to create post');
      }
      return post[0];
    }),
  updatePost: protectedProcedure
    .input(createUpdateSchema(tables.posts).required({ id: true }).omit({ ownerId: true }))
    .output(createSelectSchema(tables.posts))
    .mutation(async ({ input, ctx: { session } }) => {
      const updatedPost = await db.update(tables.posts).set(input).where(and(eq(tables.posts.id, input.id), eq(tables.posts.ownerId, session.userId))).returning();
      if (updatedPost.length === 0 || !updatedPost[0]) {
        throw new Error('Failed to update post');
      }
      return updatedPost[0];
    }),
  deletePost: protectedProcedure
    .input(createSelectSchema(tables.posts).pick({ id: true }))
    .output(z.void())
    .mutation(async ({ input, ctx: { session } }) => {
      const deletedPost = await db.delete(tables.posts).where(and(eq(tables.posts.id, input.id), eq(tables.posts.ownerId, session.userId))).returning();
      if (deletedPost.length === 0 || !deletedPost[0]) {
        throw new Error('Failed to delete post');
      }
    })
});
