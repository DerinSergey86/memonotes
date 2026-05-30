import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: 'desc' },
  });
  // Преобразуем строку tags обратно в массив
const notesWithTags = notes.map((note) => ({
  ...note,
  tags: JSON.parse(note.tags) as string[],
}));
  return NextResponse.json(notesWithTags);
}

export async function POST(request: Request) {
  const body = await request.json();
  const note = await prisma.note.create({
    data: {
      title: body.title,
      content: body.content,
      tags: JSON.stringify(body.tags), // массив -> строка
    },
  });
  return NextResponse.json(
    { ...note, tags: JSON.parse(note.tags) },
    { status: 201 }
  );
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await prisma.note.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const updatedNote = await request.json();
  const note = await prisma.note.update({
    where: { id: updatedNote.id },
    data: {
      title: updatedNote.title,
      content: updatedNote.content,
      tags: JSON.stringify(updatedNote.tags),
    },
  });
  return NextResponse.json({ ...note, tags: JSON.parse(note.tags) });
}