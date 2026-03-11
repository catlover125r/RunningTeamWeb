import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getConfig, getSchedule, getUpcomingPracticeDays, nowInPacific } from '@/lib/data';
import { WeekSchedule } from '@/lib/types';
import ScheduleEditor from '@/app/components/ScheduleEditor';

export default async function SchedulePage() {
  const cookieStore = await cookies();
  const session = getSession(null, cookieStore);

  if (!session) {
    redirect('/login');
  }

  const config = await getConfig();
  const now = new Date();
  const { hour: currentHour, dateStr: todayDateStr, date: nowPT } = nowInPacific();
  const days = getUpcomingPracticeDays(nowPT);

  const uniqueWeeks = [...new Set(days.map(d => d.weekOf))];
  const weekSchedules = await Promise.all(uniqueWeeks.map(w => getSchedule(w)));
  const schedules: Record<string, WeekSchedule> = Object.fromEntries(
    uniqueWeeks.map((w, i) => [w, weekSchedules[i]])
  );
  const publicGroups = config.groups.map(({ accessCode: _ac, ...rest }) => rest);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Schedule</h1>
        <p className="text-gray-500">
          {session.type === 'coach'
            ? 'Assign routes to any group for the next 5 practice days.'
            : `Set routes for your group's upcoming practices.`}
        </p>
      </div>
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
    </div>
  );
}
