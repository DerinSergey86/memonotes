import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

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

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const body = await request.json();
  const { name, address, latitude, longitude, radius, image, enabled } = body;

  if (!name) {
    return NextResponse.json({ error: 'Название обязательно' }, { status: 400 });
  }

  const tag = await prisma.locationTag.create({
    data: {
      name,
      address: address || '',
      latitude: latitude || null,
      longitude: longitude || null,
      radius: Number(radius) || 50,
      image: image || '',
      enabled: enabled !== undefined ? enabled : true,
      user: { connect: { id: session.user.id } },
    },
  });

  return NextResponse.json(tag, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, address, latitude, longitude, radius, image, enabled } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID обязателен' }, { status: 400 });
  }

  const existing = await prisma.locationTag.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Метка не найдена или доступ запрещён' }, { status: 404 });
  }

  const updated = await prisma.locationTag.update({
    where: { id },
    data: {
      name: name !== undefined ? name : existing.name,
      address: address !== undefined ? address : existing.address,
      latitude: latitude ?? existing.latitude,
      longitude: longitude ?? existing.longitude,
      radius: radius ?? existing.radius,
      image: image !== undefined ? image : existing.image,
      enabled: enabled !== undefined ? enabled : existing.enabled,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'ID метки обязателен' }, { status: 400 });
  }

  const tag = await prisma.locationTag.findUnique({ where: { id } });
  if (!tag || tag.userId !== session.user.id) {
    return NextResponse.json({ error: 'Метка не найдена или доступ запрещён' }, { status: 404 });
  }

  await prisma.locationTag.delete({ where: { id } });
  return NextResponse.json({ success: true });
}