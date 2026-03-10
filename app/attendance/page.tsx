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
  const today = new Date().toISOString().split('T')[0];

  const roster = config.attendanceRoster ?? [
    { label: 'Boys', runners: config.groups.flatMap(g => g.runners) },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <a href="/schedule" className="text-sm text-purple-600 hover:text-purple-800 transition-colors">
          &larr; Back to Schedule
        </a>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-2">Attendance</h1>
        <p className="text-gray-500 mt-1">Record daily attendance for the full team.</p>
      </div>

      <AttendanceManager
        roster={roster}
        initialRecords={allAttendance}
        today={today}
      />
    </div>
  );
}
