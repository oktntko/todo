import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgEnum,
  pgSchema,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// スキーマ
export const pgSchemaTodo = pgSchema('todo');

// Enum
export const pgSpaceUserRoleEnum = pgEnum('space_user_role', [
  'OWNER',
  'ADMIN',
  'EDITOR',
  'READER',
]);

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
  created_at: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// Space
export const pgSpace = pgSchemaTodo.table('space', {
  space_id: uuid('space_id').primaryKey().defaultRandom(),
  space_name: varchar('space_name', { length: 100 }).notNull(),
  space_description: varchar('space_description', { length: 400 }).default('').notNull(),
  space_image: text('space_image').default('').notNull(),
  space_color: varchar('space_color', { length: 100 }).default('').notNull(),
  aichat_enable: boolean('aichat_enable').default(false).notNull(),
  aichat_api_key: varchar('aichat_api_key', { length: 400 }).default('').notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  created_by: varchar('created_by', { length: 36 }).notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updated_by: varchar('updated_by', { length: 36 }).notNull(),
});

// SpaceUser
export const pgSpaceUser = pgSchemaTodo.table('space_user', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => pgUser.user_id, { onDelete: 'cascade' }),
  space_id: uuid('space_id')
    .notNull()
    .references(() => pgSpace.space_id, { onDelete: 'cascade' }),
  role: pgSpaceUserRoleEnum('role').notNull(),
});

// Group
export const pgGroup = pgSchemaTodo.table('group', {
  group_id: uuid('group_id').primaryKey().defaultRandom(),
  space_id: uuid('space_id')
    .notNull()
    .references(() => pgSpace.space_id, { onDelete: 'cascade' }),
  group_name: varchar('group_name', { length: 100 }).notNull(),
  group_description: varchar('group_description', { length: 400 }).default('').notNull(),
  group_order: integer('group_order').default(0).notNull(),
  group_image: text('group_image').default('').notNull(),
  group_color: varchar('group_color', { length: 100 }).default('').notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  created_by: varchar('created_by', { length: 36 }).notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updated_by: varchar('updated_by', { length: 36 }).notNull(),
});

// Todo
export const pgTodo = pgSchemaTodo.table('todo', {
  todo_id: uuid('todo_id').primaryKey().defaultRandom(),
  group_id: uuid('group_id')
    .notNull()
    .references(() => pgGroup.group_id, { onDelete: 'cascade' }),
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
  whiteboard_id: uuid('whiteboard_id').primaryKey().defaultRandom(),
  space_id: uuid('space_id')
    .notNull()
    .references(() => pgSpace.space_id, { onDelete: 'cascade' }),
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
  space_id: uuid('space_id')
    .notNull()
    .references(() => pgSpace.space_id, { onDelete: 'cascade' }),
  aichat_title: varchar('aichat_title', { length: 100 }).default('').notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  created_by: varchar('created_by', { length: 36 }).notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updated_by: varchar('updated_by', { length: 36 }).notNull(),
});

// AichatMessage
export const pgAichatMessage = pgSchemaTodo.table('aichat_message', {
  aichat_message_id: uuid('aichat_message_id').primaryKey().defaultRandom(),
  aichat_id: uuid('aichat_id')
    .notNull()
    .references(() => pgAichat.aichat_id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').references(() => pgUser.user_id, { onDelete: 'set null' }),
  role: varchar('role', { length: 10 }).notNull(),
  content: text('content').default('').notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  created_by: varchar('created_by', { length: 36 }).notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updated_by: varchar('updated_by', { length: 36 }).notNull(),
});

// Session
export const pgSession = pgSchemaTodo.table('session', {
  session_id: uuid('session_id').primaryKey().defaultRandom(),
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
  space_id: uuid('space_id')
    .notNull()
    .references(() => pgSpace.space_id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  mimetype: varchar('mimetype', { length: 100 }).notNull(),
  filesize: integer('filesize').notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  created_by: varchar('created_by', { length: 36 }).notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updated_by: varchar('updated_by', { length: 36 }).notNull(),
});

// TodoToFile (多対多の中間テーブル)
export const pgTodoToFile = pgSchemaTodo.table('todo_to_file', {
  todo_id: uuid('todo_id')
    .notNull()
    .references(() => pgTodo.todo_id, { onDelete: 'cascade' }),
  file_id: uuid('file_id')
    .notNull()
    .references(() => pgFile.file_id, { onDelete: 'cascade' }),
});

// ================= relations =================

export const pgUserRelations = relations(pgUser, ({ many }) => ({
  session_list: many(pgSession),
  space_user_list: many(pgSpaceUser),
  aichat_message_list: many(pgAichatMessage),
}));

export const pgSpaceRelations = relations(pgSpace, ({ many }) => ({
  group_list: many(pgGroup),
  whiteboard_list: many(pgWhiteboard),
  file_list: many(pgFile),
  space_user_list: many(pgSpaceUser),
  aichat_list: many(pgAichat),
}));

export const pgSpaceUserRelations = relations(pgSpaceUser, ({ one }) => ({
  user: one(pgUser, {
    fields: [pgSpaceUser.user_id],
    references: [pgUser.user_id],
  }),
  space: one(pgSpace, {
    fields: [pgSpaceUser.space_id],
    references: [pgSpace.space_id],
  }),
}));

export const pgGroupRelations = relations(pgGroup, ({ one, many }) => ({
  space: one(pgSpace, {
    fields: [pgGroup.space_id],
    references: [pgSpace.space_id],
  }),
  todo_list: many(pgTodo),
}));

export const pgTodoRelations = relations(pgTodo, ({ one, many }) => ({
  group: one(pgGroup, {
    fields: [pgTodo.group_id],
    references: [pgGroup.group_id],
  }),
  file_list: many(pgTodoToFile),
}));

export const pgWhiteboardRelations = relations(pgWhiteboard, ({ one }) => ({
  space: one(pgSpace, {
    fields: [pgWhiteboard.space_id],
    references: [pgSpace.space_id],
  }),
}));

export const pgAichatRelations = relations(pgAichat, ({ one, many }) => ({
  space: one(pgSpace, {
    fields: [pgAichat.space_id],
    references: [pgSpace.space_id],
  }),
  aichat_message_list: many(pgAichatMessage),
}));

export const pgAichatMessageRelations = relations(pgAichatMessage, ({ one }) => ({
  aichat: one(pgAichat, {
    fields: [pgAichatMessage.aichat_id],
    references: [pgAichat.aichat_id],
  }),
  user: one(pgUser, {
    fields: [pgAichatMessage.user_id],
    references: [pgUser.user_id],
  }),
}));

export const pgFileRelations = relations(pgFile, ({ one, many }) => ({
  space: one(pgSpace, {
    fields: [pgFile.space_id],
    references: [pgSpace.space_id],
  }),
  todo_list: many(pgTodoToFile),
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
  pgSpaceUser,
  pgGroup,
  pgTodo,
  pgWhiteboard,
  pgAichat,
  pgAichatMessage,
  pgSession,
  pgFile,
  pgTodoToFile,
  // relations
  pgUserRelations,
  pgSpaceRelations,
  pgSpaceUserRelations,
  pgGroupRelations,
  pgTodoRelations,
  pgWhiteboardRelations,
  pgAichatRelations,
  pgAichatMessageRelations,
  pgFileRelations,
  pgTodoToFileRelations,
};
