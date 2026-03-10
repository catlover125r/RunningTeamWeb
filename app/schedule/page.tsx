import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getConfig, getSchedule, getUpcomingPracticeDays, getAnnouncements } from '@/lib/data';
import { WeekSchedule } from '@/lib/types';
import ScheduleEditor from '@/app/components/ScheduleEditor';
import AnnouncementsManager from '@/app/components/AnnouncementsManager';
import ScheduleTabs from '@/app/components/ScheduleTabs';

export default async function SchedulePage() {
  const cookieStore = await cookies();
  const session = getSession(null, cookieStore);

  if (!session) {
    redirect('/login');
  }

  const config = await getConfig();
  const now = new Date();
  const days = getUpcomingPracticeDays(now);

  const uniqueWeeks = [...new Set(days.map(d => d.weekOf))];
  const weekSchedules = await Promise.all(uniqueWeeks.map(w => getSchedule(w)));
  const schedules: Record<string, WeekSchedule> = Object.fromEntries(
    uniqueWeeks.map((w, i) => [w, weekSchedules[i]])
  );

  const todayDateStr = now.toISOString().split('T')[0];
  const currentHour = now.getHours();
  const publicGroups = config.groups.map(({ accessCode: _ac, ...rest }) => rest);

  const announcements = session.type === 'coach' ? await getAnnouncements() : [];

  const scheduleEditor = (
    <ScheduleEditor
      groups={publicGroups}
      routes={config.routes}
      days={days}
      initialSchedules={schedules}
      sessionType={session.type}
      sessionGroupId={session.groupId}
      todayDateStr={todayDateStr}
      currentHour={currentHour}
    />
  );

  if (session.type !== 'coach') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Schedule</h1>
          <p className="text-gray-500">Your group&apos;s upcoming practice routes.</p>
        </div>
        {scheduleEditor}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Coach Dashboard</h1>
        <p className="text-gray-500">Manage schedules and team announcements.</p>
      </div>
      <ScheduleTabs
        scheduleEditor={scheduleEditor}
        announcementsManager={<AnnouncementsManager initialAnnouncements={announcements} />}
      />
    </div>
  );
}
