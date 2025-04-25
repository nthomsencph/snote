import { z } from 'zod';

export const EntrySchema = z.object({
  id: z.string(),
  index: z.number(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  preview: z.string(),
  date: z.string().datetime(),
  lastUpdated: z.string().datetime().optional(),
  icon: z.string().optional(),
});

export type Entry = z.infer<typeof EntrySchema>;

export interface Entry {
  id: string;
  index: number;
  title: string;
  content: string;
  preview: string;
  date: string;
  lastUpdated?: string;
  icon?: string;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
} 