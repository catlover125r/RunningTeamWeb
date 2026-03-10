import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/data';
import { createSessionCookie, COOKIE_NAME } from '@/lib/auth';
import { AuthSession } from '@/lib/types';

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  }

  const config = await getConfig();

  let session: AuthSession | null = null;
  let responseData: { success: boolean; type: string; groupId?: string } | null = null;

  if (code === config.coachCode) {
    session = { type: 'coach' };
    responseData = { success: true, type: 'coach' };
  } else {
    const group = config.groups.find((g) => g.accessCode === code);
    if (group) {
      session = { type: 'group', groupId: group.id };
      responseData = { success: true, type: 'group', groupId: group.id };
    }
  }

  if (!session || !responseData) {
    return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
  }

  const cookieValue = createSessionCookie(session);
  const response = NextResponse.json(responseData);

  response.cookies.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return response;
}
