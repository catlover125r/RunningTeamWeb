import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getConfig, getSchedule, getUpcomingPracticeDays } from '@/lib/data';
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
  const days = getUpcomingPracticeDays(now);

  // Load schedules for all unique weeks in the rolling window
  const uniqueWeeks = [...new Set(days.map(d => d.weekOf))];
  const weekSchedules = await Promise.all(uniqueWeeks.map(w => getSchedule(w)));
  const schedules: Record<string, WeekSchedule> = Object.fromEntries(
    uniqueWeeks.map((w, i) => [w, weekSchedules[i]])
  );

  const todayDateStr = now.toISOString().split('T')[0];
  const currentHour = now.getHours();

  const publicGroups = config.groups.map(({ accessCode: _ac, ...rest }) => rest);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Schedule Management</h1>
        <p className="text-gray-500">
          {session.type === 'coach'
            ? 'Assign routes to any group for the next 5 practice days.'
            : `Set routes for your group's upcoming practices.`}
        </p>
      </div>

      {session.type === 'coach' && <CoachAnnouncementPanel />}

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

function CoachAnnouncementPanel() {
  return (
    <div className="mb-8">
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-purple-800 text-sm">Coach Access</p>
          <p className="text-purple-700 text-xs">You can manage all groups&apos; schedules and post announcements.</p>
        </div>
        <a
          href="/announcements"
          className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors"
        >
          Manage Announcements
        </a>
      </div>
    </div>
  );
}
