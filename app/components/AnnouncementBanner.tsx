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
      <h2 className="text-lg font-bold text-gray-800 mb-3">Announcements</h2>
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="bg-purple-50 border border-purple-200 rounded-xl px-5 py-4 shadow-sm"
        >
          <p className="text-gray-800 font-medium">{announcement.content}</p>
          <p className="text-xs text-purple-500 mt-1.5">
            Posted by {announcement.author} &mdash; {formatDate(announcement.createdAt)}
          </p>
        </div>
      ))}
    </div>
  );
}
