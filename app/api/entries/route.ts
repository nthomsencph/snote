import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { EntrySchema } from '../../lib/types';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const entries = await prisma.entry.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { message: 'Failed to fetch entries', error },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const entry = await prisma.entry.create({
      data: {
        title: body.title,
        content: body.content,
        preview: body.preview,
        icon: body.icon,
      },
    });
    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      { message: 'Failed to create entry', error },
      { status: 500 }
    );
  }
} 