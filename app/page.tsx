import { Route, WeekSchedule } from '@/lib/types';
import { getConfig, getSchedule, getAnnouncements, getMondayOfWeek } from '@/lib/data';
import AnnouncementBanner from './components/AnnouncementBanner';

interface PublicGroup {
  id: string;
  name: string;
  color: string;
  runners: string[];
}

// All groups use purple shades — keyed by the stored color value
const COLOR_MAP: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  pink:   { bg: 'bg-purple-50', border: 'border-purple-300', badge: 'bg-purple-600 text-white', text: 'text-purple-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-800', badge: 'bg-purple-900 text-white', text: 'text-purple-900' },
  blue:   { bg: 'bg-purple-50', border: 'border-purple-600', badge: 'bg-purple-800 text-white', text: 'text-purple-800' },
  green:  { bg: 'bg-purple-50', border: 'border-purple-500', badge: 'bg-purple-700 text-white', text: 'text-purple-700' },
  orange: { bg: 'bg-purple-50', border: 'border-purple-400', badge: 'bg-purple-500 text-white', text: 'text-purple-500' },
};

export default async function HomePage() {
  const config = await getConfig();
  const weekOf = getMondayOfWeek(new Date());
  const schedule = await getSchedule(weekOf);
  const announcements = await getAnnouncements();
  const groups: PublicGroup[] = config.groups.map(({ accessCode: _ac, ...rest }) => rest);

  const today = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[today.getDay()];
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;

  function getTodayRoute(group: PublicGroup): Route | null {
    const groupSchedule = (schedule as WeekSchedule | null)?.groups?.[group.id];
    const routeId = groupSchedule?.[todayName]?.routeId;
    if (!routeId) return null;
    return config.routes.find((r) => r.id === routeId) || null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
          Sequoia High School<br />
          <span className="text-purple-700">Cross Country</span>
        </h1>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="mb-8">
          <AnnouncementBanner announcements={announcements} />
        </section>
      )}

      {/* Today's Routes */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Today&apos;s Route</h2>

        {isWeekend ? (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">🏃</div>
            <p className="text-purple-800 font-semibold text-lg">No practice this weekend</p>
            <p className="text-purple-600 text-sm mt-1">See you Monday!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {groups.map((group) => {
              const colors = COLOR_MAP[group.color] || COLOR_MAP.purple;
              const route = getTodayRoute(group);

              return (
                <div
                  key={group.id}
                  className={`rounded-xl border-2 ${colors.border} ${colors.bg} overflow-hidden shadow-sm`}
                >
                  <div className="px-5 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
                      {group.name}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Today&apos;s Route</p>
                  </div>
                  <div className="bg-white border-t border-gray-100">
                    {route ? (
                      <>
                        <div className="px-5 pt-4 pb-2">
                          <h3 className="font-bold text-xl text-gray-900">{route.name}</h3>
                          {route.distance && <p className="text-purple-700 font-medium text-sm mt-1">{route.distance}</p>}
                          <p className="text-gray-500 text-sm mt-1">{route.description}</p>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/routes/${route.imageFile}`}
                          alt={route.name}
                          className="w-full object-contain"
                        />
                      </>
                    ) : (
                      <p className="px-5 py-5 text-gray-400 italic">No route assigned yet</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
