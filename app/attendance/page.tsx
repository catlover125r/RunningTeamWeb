import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getConfig, getAllAttendance } from '@/lib/data';
import AttendanceManager from '@/app/components/AttendanceManager';

export default async function AttendancePage() {
  const cookieStore = await cookies();
  const session = getSession(null, cookieStore);

  if (!session || session.type !== 'coach') {
    redirect('/login');
  }

  const config = await getConfig();
  const allAttendance = await getAllAttendance();

  // Today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // Strip access codes
  const publicGroups = config.groups.map(({ accessCode: _ac, ...rest }) => rest);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <a href="/schedule" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
            &larr; Back to Schedule
          </a>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Attendance Tracking</h1>
        <p className="text-gray-500 mt-1">Record daily attendance for each running group.</p>
      </div>

      <AttendanceManager
        groups={publicGroups}
        initialRecords={allAttendance}
        today={today}
      />
    </div>
  );
}
