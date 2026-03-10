import { NextRequest } from 'next/server';
import { AuthSession } from './types';

const COOKIE_NAME = 'rt_session';

export function getSession(request: NextRequest | null, cookieStore?: { get: (name: string) => { value: string } | undefined }): AuthSession | null {
  let cookieValue: string | undefined;

  if (cookieStore) {
    cookieValue = cookieStore.get(COOKIE_NAME)?.value;
  } else if (request) {
    cookieValue = request.cookies.get(COOKIE_NAME)?.value;
  }

  if (!cookieValue) return null;

  try {
    const decoded = Buffer.from(cookieValue, 'base64').toString('utf-8');
    return JSON.parse(decoded) as AuthSession;
  } catch {
    return null;
  }
}

export function createSessionCookie(session: AuthSession): string {
  const encoded = Buffer.from(JSON.stringify(session)).toString('base64');
  return encoded;
}

export { COOKIE_NAME };
