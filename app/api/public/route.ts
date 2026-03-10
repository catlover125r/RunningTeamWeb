import { NextResponse } from 'next/server';
import { getConfig, getSchedule, getAnnouncements, getMondayOfWeek } from '@/lib/data';

export async function GET() {
  const config = await getConfig();
  const weekOf = getMondayOfWeek(new Date());
  const schedule = await getSchedule(weekOf);
  const announcements = await getAnnouncements();

  // Strip access codes from groups
  const publicGroups = config.groups.map(({ accessCode: _accessCode, ...rest }) => rest);

  return NextResponse.json({
    groups: publicGroups,
    routes: config.routes,
    weekOf,
    schedule,
    announcements,
  });
}
