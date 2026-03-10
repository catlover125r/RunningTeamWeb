import { Announcement } from '@/lib/types';

interface Props {
  announcements: Announcement[];
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AnnouncementBanner({ announcements }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-yellow-900 text-xs font-bold">!</span>
        </div>
        <h2 className="text-lg font-bold text-gray-800">Announcements</h2>
      </div>
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg px-5 py-4 shadow-sm"
        >
          <p className="text-gray-800 font-medium">{announcement.content}</p>
          <p className="text-xs text-gray-500 mt-1.5">
            Posted by {announcement.author} &mdash; {formatDate(announcement.createdAt)}
          </p>
        </div>
      ))}
    </div>
  );
}
