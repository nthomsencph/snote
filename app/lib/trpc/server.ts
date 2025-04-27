import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { createEntrySchema, updateEntrySchema } from './schemas';
import { db } from '../db';
import { entries } from '../db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const t = initTRPC.create();
const router = t.router;
const publicProcedure = t.procedure;

// Define the entries router
const entriesRouter = router({
  getAll: publicProcedure.query(async () => {
    return db.select().from(entries).orderBy(entries.date);
  }),

  getById: publicProcedure.input(z.string()).query(async ({ input }) => {
    const results = await db.select().from(entries).where(eq(entries.id, input)).limit(1);
    return results[0];
  }),

  create: publicProcedure.input(createEntrySchema).mutation(async ({ input }) => {
    // Get the last entry to determine the next index
    const lastEntry = await db
      .select({ index: entries.index })
      .from(entries)
      .orderBy(entries.index)
      .limit(1);

    const nextIndex = (lastEntry[0]?.index ?? 0) + 1;

    const newEntry = {
      id: nanoid(),
      ...input,
      index: nextIndex,
      date: new Date(),
    };

    await db.insert(entries).values(newEntry);
    return newEntry;
  }),

  update: publicProcedure.input(updateEntrySchema).mutation(async ({ input }) => {
    const { id, ...data } = input;

    await db
      .update(entries)
      .set({ ...data, lastUpdated: new Date() })
      .where(eq(entries.id, id));

    return { id, ...data };
  }),

  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    await db.delete(entries).where(eq(entries.id, input));
    return { id: input };
  }),
});

// Export the app router
export const appRouter = router({
  entries: entriesRouter,
});

export type AppRouter = typeof appRouter;
