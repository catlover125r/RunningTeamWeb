import { Announcement, Route, WeekSchedule } from '@/lib/types';
import AnnouncementBanner from './components/AnnouncementBanner';

interface PublicGroup {
  id: string;
  name: string;
  color: string;
  runners: string[];
}

interface PublicData {
  groups: PublicGroup[];
  routes: Route[];
  weekOf: string;
  schedule: WeekSchedule | null;
  announcements: Announcement[];
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
};

const COLOR_MAP: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-600 text-white',
    text: 'text-blue-700',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-600 text-white',
    text: 'text-green-700',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-500 text-white',
    text: 'text-orange-700',
  },
};

function formatWeekOf(weekOf: string): string {
  const date = new Date(weekOf + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

async function getPublicData(): Promise<PublicData> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/public`, { cache: 'no-store' });
  return res.json();
}

export default async function HomePage() {
  const data = await getPublicData();
  const { groups, routes, weekOf, schedule, announcements } = data;

  function getRoute(routeId: string | null): Route | null {
    if (!routeId) return null;
    return routes.find((r) => r.id === routeId) || null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
          Season in Progress
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
          Lincoln High<br />
          <span className="text-blue-700">Running Team</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Weekly route schedules for all groups &mdash; Varsity, Junior Varsity, and Freshman.
        </p>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="mb-8">
          <AnnouncementBanner announcements={announcements} />
        </section>
      )}

      {/* This Week's Routes */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">This Week&apos;s Routes</h2>
          <span className="text-sm text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1">
            Week of {formatWeekOf(weekOf)}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {groups.map((group) => {
            const colors = COLOR_MAP[group.color] || COLOR_MAP.blue;
            const groupSchedule = schedule?.groups?.[group.id];

            return (
              <div
                key={group.id}
                className={`rounded-xl border-2 ${colors.border} ${colors.bg} overflow-hidden shadow-sm`}
              >
                {/* Group header */}
                <div className="px-5 py-4 border-b border-inherit">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
                      {group.name}
                    </span>
                    <span className="text-xs text-gray-500">{group.runners.length} runners</span>
                  </div>
                </div>

                {/* Days */}
                <div className="divide-y divide-gray-100">
                  {DAYS.map((day) => {
                    const dayData = groupSchedule?.[day];
                    const route = getRoute(dayData?.routeId || null);

                    return (
                      <div key={day} className="px-5 py-3 bg-white">
                        <div className="flex items-start gap-3">
                          <span className={`text-xs font-bold uppercase tracking-wider mt-0.5 w-8 ${colors.text}`}>
                            {DAY_LABELS[day]}
                          </span>
                          {route ? (
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 text-sm truncate">{route.name}</p>
                              <p className="text-xs text-gray-500">{route.distance}</p>
                            </div>
                          ) : (
                            <div className="flex-1">
                              <p className="text-sm text-gray-400 italic">TBD</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Runners preview */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {group.runners.slice(0, 3).join(', ')}
                    {group.runners.length > 3 && ` +${group.runners.length - 3} more`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Routes Legend */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Available Routes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((route) => (
            <div key={route.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-800">{route.name}</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap font-medium">
                  {route.distance}
                </span>
              </div>
              <p className="text-sm text-gray-500">{route.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
