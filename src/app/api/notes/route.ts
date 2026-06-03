import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth'; // импорт функции для получения сессии

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  const notesWithTags = notes.map((note) => ({
    ...note,
    tags: JSON.parse(note.tags) as string[],
  }));

  return NextResponse.json(notesWithTags);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const body = await request.json();
  const note = await prisma.note.create({
    data: {
      title: body.title,
      content: body.content,
      tags: JSON.stringify(body.tags),
      type: body.type || 'note',          // по умолчанию "note"
      userId: session.user.id,
      dueDate: body.dueDate || null,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      location: body.location || null,
    },
  });

  return NextResponse.json(
    { ...note, tags: JSON.parse(note.tags) },
    { status: 201 }
  );
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await request.json();
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.userId !== session.user.id) {
    return NextResponse.json({ error: 'Заметка не найдена или доступ запрещён' }, { status: 404 });
  }

  await prisma.note.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const updatedNote = await request.json();
  const existingNote = await prisma.note.findUnique({ where: { id: updatedNote.id } });
  if (!existingNote || existingNote.userId !== session.user.id) {
    return NextResponse.json({ error: 'Заметка не найдена или доступ запрещён' }, { status: 404 });
  }

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