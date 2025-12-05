import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgSchema,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// スキーマ
export const pgSchemaTodo = pgSchema('todo');

// User
export const pgUser = pgSchemaTodo.table('user', {
  user_id: uuid('user_id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  avatar_image: text('avatar_image').default('').notNull(),
  description: varchar('description', { length: 400 }).default('').notNull(),
  twofa_enable: boolean('twofa_enable').default(false).notNull(),
  twofa_secret: varchar('twofa_secret', { length: 255 }).default('').notNull(),
  aichat_enable: boolean('aichat_enable').default(false).notNull(),
  aichat_model: varchar('aichat_model', { length: 100 }).default('').notNull(),
  aichat_api_key: varchar('aichat_api_key', { length: 255 }).default('').notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// Space
export const pgSpace = pgSchemaTodo.table('space', {
  space_id: serial('space_id').primaryKey(),
  owner_id: uuid('owner_id')
    .notNull()
    .references(() => pgUser.user_id, { onDelete: 'cascade' }),
  space_name: varchar('space_name', { length: 100 }).notNull(),
  space_description: varchar('space_description', { length: 400 }).default('').notNull(),
  space_order: integer('space_order').default(0).notNull(),
  space_image: text('space_image').default('').notNull(),
  space_color: varchar('space_color', { length: 100 }).default('').notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  created_by: varchar('created_by', { length: 36 }).notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updated_by: varchar('updated_by', { length: 36 }).notNull(),
});

// Todo
export const pgTodo = pgSchemaTodo.table('todo', {
  todo_id: uuid('todo_id').primaryKey().defaultRandom(),
  space_id: integer('space_id')
    .notNull()
    .references(() => pgSpace.space_id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 100 }).default('').notNull(),
  description: text('description').default('').notNull(),
  begin_date: varchar('begin_date', { length: 10 }).default('').notNull(),
  begin_time: varchar('begin_time', { length: 10 }).default('').notNull(),
  limit_date: varchar('limit_date', { length: 10 }).default('').notNull(),
  limit_time: varchar('limit_time', { length: 10 }).default('').notNull(),
  order: integer('order').default(0).notNull(),
  done_at: timestamp('done_at', { withTimezone: true, mode: 'date' }),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  created_by: varchar('created_by', { length: 36 }).notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updated_by: varchar('updated_by', { length: 36 }).notNull(),
});

// Whiteboard
export const pgWhiteboard = pgSchemaTodo.table('whiteboard', {
  whiteboard_id: serial('whiteboard_id').primaryKey(),
  owner_id: uuid('owner_id')
    .notNull()
    .references(() => pgUser.user_id, { onDelete: 'cascade' }),
  whiteboard_name: varchar('whiteboard_name', { length: 100 }).default('').notNull(),
  whiteboard_description: varchar('whiteboard_description', { length: 400 }).default('').notNull(),
  whiteboard_order: integer('whiteboard_order').default(0).notNull(),
  whiteboard_content: text('whiteboard_content').default('').notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  created_by: varchar('created_by', { length: 36 }).notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updated_by: varchar('updated_by', { length: 36 }).notNull(),
});

// Aichat
export const pgAichat = pgSchemaTodo.table('aichat', {
  aichat_id: uuid('aichat_id').primaryKey().defaultRandom(),
  message: text('message').notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// Session
export const pgSession = pgSchemaTodo.table('session', {
  session_id: serial('session_id').primaryKey(),
  session_key: varchar('session_key', { length: 255 }).notNull().unique(),
  originalMaxAge: integer('originalMaxAge'),
  expires: timestamp('expires', { withTimezone: true, mode: 'date' }).defaultNow(),
  user_id: uuid('user_id').references(() => pgUser.user_id, {
    onDelete: 'cascade',
  }),
  data: text('data').default('{}').notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// File
export const pgFile = pgSchemaTodo.table('file', {
  file_id: uuid('file_id').primaryKey().defaultRandom(),
  filename: varchar('filename', { length: 255 }).notNull(),
  mimetype: varchar('mimetype', { length: 100 }).notNull(),
  filesize: integer('filesize').notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  created_by: varchar('created_by', { length: 36 }).notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updated_by: varchar('updated_by', { length: 36 }).notNull(),
});

// ================= Many-to-many =================
export const pgUserToFile = pgSchemaTodo.table(
  'user_to_file',
  {
    user_id: uuid('user_id')
      .notNull()
      .references(() => pgUser.user_id),
    file_id: uuid('file_id')
      .notNull()
      .references(() => pgFile.file_id),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.file_id] })],
);

export const pgTodoToFile = pgSchemaTodo.table(
  'todo_to_file',
  {
    todo_id: uuid('todo_id')
      .notNull()
      .references(() => pgTodo.todo_id),
    file_id: uuid('file_id')
      .notNull()
      .references(() => pgFile.file_id),
  },
  (t) => [primaryKey({ columns: [t.todo_id, t.file_id] })],
);

// ================= relations =================

export const pgUserRelations = relations(pgUser, ({ many }) => ({
  session_list: many(pgSession),
  file_list: many(pgUserToFile),
  space_list: many(pgSpace),
  whiteboard_list: many(pgWhiteboard),
}));

export const pgSpaceRelations = relations(pgSpace, ({ one, many }) => ({
  owner: one(pgUser, {
    fields: [pgSpace.owner_id],
    references: [pgUser.user_id],
  }),
  todo_list: many(pgTodo),
}));

export const pgTodoRelations = relations(pgTodo, ({ one, many }) => ({
  space: one(pgSpace, {
    fields: [pgTodo.space_id],
    references: [pgSpace.space_id],
  }),
  file_list: many(pgTodoToFile),
}));

export const pgWhiteboardRelations = relations(pgWhiteboard, ({ one }) => ({
  owner: one(pgUser, {
    fields: [pgWhiteboard.owner_id],
    references: [pgUser.user_id],
  }),
}));

export const pgFileRelations = relations(pgFile, ({ many }) => ({
  user_list: many(pgUserToFile),
  todo_list: many(pgTodoToFile),
}));

export const pgUserToFileRelations = relations(pgUserToFile, ({ one }) => ({
  user: one(pgUser, {
    fields: [pgUserToFile.user_id],
    references: [pgUser.user_id],
  }),
  file: one(pgFile, {
    fields: [pgUserToFile.file_id],
    references: [pgFile.file_id],
  }),
}));

export const pgTodoToFileRelations = relations(pgTodoToFile, ({ one }) => ({
  todo: one(pgTodo, {
    fields: [pgTodoToFile.todo_id],
    references: [pgTodo.todo_id],
  }),
  file: one(pgFile, {
    fields: [pgTodoToFile.file_id],
    references: [pgFile.file_id],
  }),
}));

export const schema = {
  pgUser,
  pgSpace,
  pgTodo,
  pgWhiteboard,
  pgAichat,
  pgSession,
  pgFile,
  pgUserToFile,
  pgTodoToFile,
  // relations
  pgUserRelations,
  pgSpaceRelations,
  pgTodoRelations,
  pgWhiteboardRelations,
  pgFileRelations,
  pgUserToFileRelations,
  pgTodoToFileRelations,
};
