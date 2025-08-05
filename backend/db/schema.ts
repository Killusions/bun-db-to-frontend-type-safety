import { relations } from 'drizzle-orm'
import { pgTable, uuid, varchar, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';
export * from './auth-schema';

export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: varchar('owner_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  isPrivate: boolean('is_private').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('posts_owner_id_idx').on(t.ownerId),
  index('posts_is_private_idx').on(t.isPrivate),
]);

// posts → user (owner)
export const postsRelations = relations(posts, ({ one, many }) => ({
  owner: one(user, {
    fields: [posts.ownerId],
    references: [user.id]
  })
}));
