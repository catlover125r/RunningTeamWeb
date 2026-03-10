import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getConfig, getSchedule, saveSchedule, getMondayOfWeek } from '@/lib/data';
import { DaySchedule } from '@/lib/types';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const DAY_NAMES_MAP: Record<number, string> = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
};

export async function GET(request: NextRequest) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const weekOf = getMondayOfWeek(new Date());
  const schedule = await getSchedule(weekOf);

  return NextResponse.json({ weekOf, schedule });
}

export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { day, routeId, groupId: bodyGroupId } = body;

  if (!day || !DAYS.includes(day)) {
    return NextResponse.json({ error: 'Invalid day. Must be monday through friday.' }, { status: 400 });
  }

  const now = new Date();
  const todayDayName = DAY_NAMES_MAP[now.getDay()];
  const currentHour = now.getHours();

  // Check 5pm cutoff for today
  if (todayDayName === day && currentHour >= 17) {
    return NextResponse.json({ error: 'Changes are locked after 5pm' }, { status: 403 });
  }

  // Check past days
  const dayIndex = DAYS.indexOf(day);
  const todayIndex = todayDayName ? DAYS.indexOf(todayDayName) : -1;
  if (todayIndex >= 0 && dayIndex < todayIndex) {
    return NextResponse.json({ error: 'Cannot change routes for past days' }, { status: 403 });
  }

  // Validate routeId if provided
  const config = await getConfig();
  if (routeId !== null && routeId !== undefined) {
    const validRoute = config.routes.find((r) => r.id === routeId);
    if (!validRoute) {
      return NextResponse.json({ error: 'Invalid route ID' }, { status: 400 });
    }
  }

  // Determine which groups to update
  let targetGroupId: string;
  if (session.type === 'coach') {
    if (!bodyGroupId) {
      return NextResponse.json({ error: 'groupId required for coach' }, { status: 400 });
    }
    const validGroup = config.groups.find((g) => g.id === bodyGroupId);
    if (!validGroup) {
      return NextResponse.json({ error: 'Invalid groupId' }, { status: 400 });
    }
    targetGroupId = bodyGroupId;
  } else {
    if (!session.groupId) {
      return NextResponse.json({ error: 'No group in session' }, { status: 401 });
    }
    targetGroupId = session.groupId;
  }

  const weekOf = getMondayOfWeek(now);
  const schedule = await getSchedule(weekOf);

  const updatedBy = session.type === 'coach' ? 'Coach' : `Group: ${targetGroupId}`;

  const daySchedule: DaySchedule = {
    routeId: routeId ?? null,
    updatedAt: now.toISOString(),
    updatedBy,
  };

  if (!schedule.groups[targetGroupId]) {
    schedule.groups[targetGroupId] = {};
  }
  schedule.groups[targetGroupId][day] = daySchedule;

  await saveSchedule(weekOf, schedule);

  return NextResponse.json({ success: true, weekOf, day, routeId, groupId: targetGroupId });
}
