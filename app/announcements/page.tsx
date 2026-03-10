import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getAnnouncements } from '@/lib/data';
import AnnouncementsManager from '@/app/components/AnnouncementsManager';

export default async function AnnouncementsPage() {
  const cookieStore = await cookies();
  const session = getSession(null, cookieStore);

  if (!session || session.type !== 'coach') {
    redirect('/login');
  }

  const announcements = await getAnnouncements();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <a href="/schedule" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
            &larr; Back to Schedule
          </a>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Announcements</h1>
        <p className="text-gray-500 mt-1">Post team-wide announcements visible on the homepage.</p>
      </div>

      <AnnouncementsManager initialAnnouncements={announcements} />
    </div>
  );
}
