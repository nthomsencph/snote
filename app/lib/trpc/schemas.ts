import { z } from 'zod';

export const createEntrySchema = z.object({
  title: z.string(),
  content: z.string(),
  preview: z.string(),
  icon: z.string().optional(),
});

export const updateEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  preview: z.string(),
  icon: z.string().optional(),
});

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
