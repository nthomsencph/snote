import { pgTable, text, timestamp, serial } from 'drizzle-orm/pg-core';

export const entries = pgTable('entries', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  preview: text('preview').notNull(),
  date: timestamp('date').notNull().defaultNow(),
  lastUpdated: timestamp('lastUpdated'),
  icon: text('icon'),
  index: serial('index').notNull(),
});
