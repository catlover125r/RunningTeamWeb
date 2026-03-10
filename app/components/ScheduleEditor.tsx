'use client';

import { useState, useCallback } from 'react';
import { Route, WeekSchedule } from '@/lib/types';

interface Group {
  id: string;
  name: string;
  color: string;
  runners: string[];
}

interface ScheduleEditorProps {
  groups: Group[];
  routes: Route[];
  weekOf: string;
  initialSchedule: WeekSchedule | null;
  sessionType: 'coach' | 'group';
  sessionGroupId?: string;
  todayDayName: string | null;
  currentHour: number;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
};

const COLOR_MAP: Record<string, {
  headerBg: string;
  badge: string;
  accent: string;
  lockedBg: string;
}> = {
  blue: {
    headerBg: 'bg-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    accent: 'text-blue-600',
    lockedBg: 'bg-blue-50',
  },
  green: {
    headerBg: 'bg-green-700',
    badge: 'bg-green-100 text-green-800',
    accent: 'text-green-600',
    lockedBg: 'bg-green-50',
  },
  orange: {
    headerBg: 'bg-orange-600',
    badge: 'bg-orange-100 text-orange-800',
    accent: 'text-orange-600',
    lockedBg: 'bg-orange-50',
  },
  purple: {
    headerBg: 'bg-purple-700',
    badge: 'bg-purple-100 text-purple-800',
    accent: 'text-purple-600',
    lockedBg: 'bg-purple-50',
  },
  pink: {
    headerBg: 'bg-pink-600',
    badge: 'bg-pink-100 text-pink-800',
    accent: 'text-pink-600',
    lockedBg: 'bg-pink-50',
  },
};

function isDayLocked(day: string, todayDayName: string | null, currentHour: number): boolean {
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const todayIdx = todayDayName ? dayOrder.indexOf(todayDayName) : -1;
  const dayIdx = dayOrder.indexOf(day);

  if (todayIdx < 0) return false; // weekend: nothing locked for past days by this logic

  if (dayIdx < todayIdx) return true; // past day
  if (dayIdx === todayIdx && currentHour >= 17) return true; // today after 5pm

  return false;
}

type Toast = { id: number; message: string; type: 'success' | 'error' };

export default function ScheduleEditor({
  groups,
  routes,
  weekOf,
  initialSchedule,
  sessionType,
  sessionGroupId,
  todayDayName,
  currentHour,
}: ScheduleEditorProps) {
  const [schedule, setSchedule] = useState<WeekSchedule>(
    initialSchedule || { weekOf, groups: {} }
  );
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [saving, setSaving] = useState<string | null>(null); // "groupId:day"

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const visibleGroups = sessionType === 'coach'
    ? groups
    : groups.filter((g) => g.id === sessionGroupId);

  async function handleRouteChange(groupId: string, day: string, routeId: string | null) {
    const key = `${groupId}:${day}`;
    setSaving(key);

    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          day,
          routeId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update local state
        setSchedule((prev) => {
          const updated = { ...prev };
          if (!updated.groups[groupId]) updated.groups[groupId] = {};
          updated.groups[groupId] = {
            ...updated.groups[groupId],
            [day]: {
              routeId,
              updatedAt: new Date().toISOString(),
              updatedBy: sessionType === 'coach' ? 'Coach' : `Group: ${groupId}`,
            },
          };
          return updated;
        });
        addToast('Route updated successfully', 'success');
      } else {
        addToast(data.error || 'Failed to update route', 'error');
      }
    } catch {
      addToast('Network error. Please try again.', 'error');
    } finally {
      setSaving(null);
    }
  }

  function formatWeekOf(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  return (
    <div>
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.message}
          </div>
        ))}
      </div>

      {/* Week header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Week of {formatWeekOf(weekOf)}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {sessionType === 'coach' ? 'Managing all groups' : `${visibleGroups[0]?.name} schedule`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Locked after 5pm</span>
        </div>
      </div>

      {/* Group schedule cards */}
      <div className={`grid gap-6 ${visibleGroups.length === 1 ? 'grid-cols-1 max-w-2xl' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}`}>
        {visibleGroups.map((group) => {
          const colors = COLOR_MAP[group.color] || COLOR_MAP.purple;
          const groupSchedule = schedule.groups[group.id];

          return (
            <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Group header */}
              <div className={`${colors.headerBg} px-5 py-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg">{group.name}</h3>
                  <span className="text-white text-opacity-80 text-sm">{group.runners.length} runners</span>
                </div>
              </div>

              {/* Days */}
              <div className="divide-y divide-gray-100">
                {DAYS.map((day) => {
                  const locked = isDayLocked(day, todayDayName, currentHour);
                  const dayData = groupSchedule?.[day];
                  const currentRouteId = dayData?.routeId || '';
                  const isSaving = saving === `${group.id}:${day}`;
                  const isToday = todayDayName === day;

                  return (
                    <div
                      key={day}
                      className={`px-5 py-3.5 ${locked ? 'bg-gray-50' : 'hover:bg-gray-50/50'} transition-colors`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Day label */}
                        <div className="w-20 flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-sm font-semibold ${isToday ? colors.accent : 'text-gray-700'}`}>
                              {DAY_LABELS[day]}
                            </span>
                            {isToday && (
                              <span className={`text-xs ${colors.badge} px-1.5 py-0.5 rounded-full font-medium`}>
                                Today
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Route selector or locked display */}
                        <div className="flex-1">
                          {locked ? (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span className="text-sm text-gray-500">
                                {currentRouteId
                                  ? routes.find((r) => r.id === currentRouteId)?.name || 'Unknown route'
                                  : 'No route assigned'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <select
                                value={currentRouteId}
                                onChange={(e) => handleRouteChange(group.id, day, e.target.value || null)}
                                disabled={isSaving}
                                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-wait cursor-pointer"
                              >
                                <option value="">— No route (TBD) —</option>
                                {routes.map((route) => (
                                  <option key={route.id} value={route.id}>
                                    {route.name} ({route.distance})
                                  </option>
                                ))}
                              </select>
                              {isSaving && (
                                <svg className="animate-spin h-4 w-4 text-purple-500 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekend message */}
      {(todayDayName === null) && (
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-5 text-center">
          <p className="text-purple-700 font-medium">It&apos;s the weekend!</p>
          <p className="text-purple-600 text-sm mt-1">Next week&apos;s schedule starts Monday. You can set routes for next week now.</p>
        </div>
      )}
    </div>
  );
}
