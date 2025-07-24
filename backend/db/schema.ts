import { pgTable, uuid, varchar, text, timestamp, index, uniqueIndex, primaryKey, boolean } from "drizzle-orm/pg-core"
export const users = pgTable('users', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 })
    .notNull()
    .unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  hashedPassword: text('hashed_password').notNull(),
}, (table) => [
  index("name_idx").on(table.name),
  uniqueIndex("email_idx").on(table.email)
]);

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  idleExpiresAt: timestamp("idle_expires_at", { withTimezone: true }).notNull(), // for inactivity timeout
});

export const roles = pgTable("roles", {
  name: varchar("name", { length: 64 }).primaryKey(),
  description: text("description"),
});

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    roleName: varchar("role_name", { length: 64 }).notNull().references(() => roles.name, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.roleName] }), index("user_roles_user_idx").on(t.userId)]
);

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  isPrivate: boolean("is_private").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
