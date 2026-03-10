import { Route, WeekSchedule } from '@/lib/types';
import { getConfig, getSchedule, getAnnouncements, getMondayOfWeek } from '@/lib/data';
import AnnouncementBanner from './components/AnnouncementBanner';

interface PublicGroup {
  id: string;
  name: string;
  color: string;
  runners: string[];
}

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
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-700 text-white',
    text: 'text-purple-700',
  },
  pink: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    badge: 'bg-pink-600 text-white',
    text: 'text-pink-600',
  },
};

export default async function HomePage() {
  const config = await getConfig();
  const weekOf = getMondayOfWeek(new Date());
  const schedule = await getSchedule(weekOf);
  const announcements = await getAnnouncements();
  const groups: PublicGroup[] = config.groups.map(({ accessCode: _ac, ...rest }) => rest);
  const routes = config.routes;

  const today = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[today.getDay()];
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;

  function getRoute(routeId: string | null | undefined): Route | null {
    if (!routeId) return null;
    return routes.find((r) => r.id === routeId) || null;
  }

  function getTodayRoute(group: PublicGroup): Route | null {
    const groupSchedule = (schedule as WeekSchedule | null)?.groups?.[group.id];
    const dayData = groupSchedule?.[todayName];
    return getRoute(dayData?.routeId);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <span className="w-2 h-2 bg-purple-500 rounded-full inline-block"></span>
          Season in Progress
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
          Sequoia High School<br />
          <span className="text-purple-700">Cross Country</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Today&apos;s route for Boys and Girls XC.
        </p>
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
                  <div className="px-5 py-5 bg-white border-t border-gray-100">
                    {route ? (
                      <>
                        <h3 className="font-bold text-xl text-gray-900">{route.name}</h3>
                        <p className="text-purple-700 font-medium text-sm mt-1">{route.distance}</p>
                        <p className="text-gray-500 text-sm mt-2">{route.description}</p>
                      </>
                    ) : (
                      <p className="text-gray-400 italic">No route assigned yet</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Routes Legend */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Available Routes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((route) => (
            <div key={route.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-800">{route.name}</h3>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full whitespace-nowrap font-medium">
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
