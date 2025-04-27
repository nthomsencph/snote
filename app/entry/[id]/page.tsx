import { notFound } from 'next/navigation';
import { db } from '../../lib/db';
import { entries } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { EntryForm } from '../../components/entries';

interface EntryPageProps {
  params: {
    id: string;
  };
}

export default async function EntryPage({ params }: EntryPageProps) {
  const [entry] = await db.select().from(entries).where(eq(entries.id, params.id));

  if (!entry) {
    notFound();
  }

  const formattedEntry = {
    ...entry,
    date: entry.date.toISOString(),
    lastUpdated: entry.lastUpdated?.toISOString() || undefined,
    icon: entry.icon || undefined,
  };

  return <EntryForm entry={formattedEntry} id={params.id} />;
}
