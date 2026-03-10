import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAnnouncements, addAnnouncement, deleteAnnouncement } from '@/lib/data';

export async function GET() {
  const announcements = await getAnnouncements();
  return NextResponse.json(announcements);
}

export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (!session || session.type !== 'coach') {
    return NextResponse.json({ error: 'Coach access required' }, { status: 403 });
  }

  const { content } = await request.json();
  if (!content || typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  const announcement = await addAnnouncement(content.trim(), 'Coach');
  return NextResponse.json(announcement, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = getSession(request);
  if (!session || session.type !== 'coach') {
    return NextResponse.json({ error: 'Coach access required' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id query parameter required' }, { status: 400 });
  }

  await deleteAnnouncement(id);
  return NextResponse.json({ success: true });
}
