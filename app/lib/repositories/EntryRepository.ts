import { Entry } from '../types';
import { prisma } from '../prisma';

export class EntryRepository {
  async getAll(): Promise<Entry[]> {
    try {
      console.log('Fetching entries from database...');
      const entries = await prisma.entry.findMany({
        orderBy: { date: 'desc' }
      });
      console.log('Successfully fetched entries:', entries);

      return entries.map(entry => ({
        ...entry,
        date: entry.date.toISOString(),
        lastUpdated: entry.lastUpdated.toISOString()
      }));
    } catch (error) {
      console.error('Error fetching entries:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Entry | null> {
    const entry = await prisma.entry.findUnique({
      where: { id }
    });

    if (!entry) return null;

    return {
      ...entry,
      date: entry.date.toISOString(),
      lastUpdated: entry.lastUpdated.toISOString()
    };
  }

  private async getNextIndex(): Promise<number> {
    const lastEntry = await prisma.entry.findFirst({
      orderBy: { index: 'desc' }
    });
    return (lastEntry?.index ?? 0) + 1;
  }

  async create(entry: Omit<Entry, 'id' | 'date' | 'lastUpdated' | 'index'>): Promise<Entry> {
    try {
      const nextIndex = await this.getNextIndex();
      
      const newEntry = await prisma.entry.create({
        data: {
          title: entry.title,
          content: entry.content,
          preview: entry.preview,
          index: nextIndex
        }
      });

      return {
        ...newEntry,
        date: newEntry.date.toISOString(),
        lastUpdated: newEntry.lastUpdated.toISOString()
      };
    } catch (error) {
      console.error('Error creating entry:', error);
      throw new Error('Failed to create entry: ' + (error as Error).message);
    }
  }

  async update(id: string, data: Partial<Entry>): Promise<Entry> {
    const updatedEntry = await prisma.entry.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        preview: data.preview,
        // Don't update the index
      }
    });

    return {
      ...updatedEntry,
      date: updatedEntry.date.toISOString(),
      lastUpdated: updatedEntry.lastUpdated.toISOString()
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.entry.delete({
      where: { id }
    });
  }
} 