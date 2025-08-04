import { relations } from 'drizzle-orm';
import { pgTable, varchar, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { user, session, account } from './base-schema';
export * from './base-schema';

// Custom tables for role-based authorization (extending BetterAuth)
export const role = pgTable('role', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 64 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('role_name_idx').on(table.name)
]);

export const userRole = pgTable('user_role', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  roleId: varchar('role_id', { length: 255 }).notNull().references(() => role.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('user_role_user_id_idx').on(table.userId),
  index('user_role_role_id_idx').on(table.roleId),
  uniqueIndex('user_role_unique_idx').on(table.userId, table.roleId)
]);

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  userRoles: many(userRole)
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id]
  })
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id]
  })
}));

export const roleRelations = relations(role, ({ many }) => ({
  userRoles: many(userRole)
}));

export const userRoleRelations = relations(userRole, ({ one }) => ({
  user: one(user, {
    fields: [userRole.userId],
    references: [user.id]
  }),
  role: one(role, {
    fields: [userRole.roleId],
    references: [role.id]
  })
}));
