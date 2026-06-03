import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/location-tags
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const tags = await prisma.locationTag.findMany({
    where: { userId: session.user.id },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(tags);
}

// POST /api/location-tags
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const body = await request.json();
  const { name, address, latitude, longitude } = body;

  if (!name || !address) {
    return NextResponse.json({ error: 'Название и адрес обязательны' }, { status: 400 });
  }

  const tag = await prisma.locationTag.create({
    data: {
      name,
      address,
      latitude: latitude || null,
      longitude: longitude || null,
      userId: session.user.id,
    },
  });

  return NextResponse.json(tag, { status: 201 });
}

// DELETE /api/location-tags
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'ID метки обязателен' }, { status: 400 });
  }

  // Проверяем, что метка принадлежит пользователю
  const tag = await prisma.locationTag.findUnique({ where: { id } });
  if (!tag || tag.userId !== session.user.id) {
    return NextResponse.json({ error: 'Метка не найдена или доступ запрещён' }, { status: 404 });
  }

  await prisma.locationTag.delete({ where: { id } });
  return NextResponse.json({ success: true });
}