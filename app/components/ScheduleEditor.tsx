'use client';

import { useState, useCallback } from 'react';
import { Route, WeekSchedule } from '@/lib/types';
import { ScheduleDay } from '@/lib/data';

interface Group {
  id: string;
  name: string;
  color: string;
  runners: string[];
}

interface ScheduleEditorProps {
  groups: Group[];
  routes: Route[];
  days: ScheduleDay[];
  initialSchedules: Record<string, WeekSchedule>;
  sessionType: 'coach' | 'group';
  sessionGroupId?: string;
  todayDateStr: string;
  currentHour: number;
}

// All groups use purple shades — keyed by the stored color value
const COLOR_MAP: Record<string, {
  headerBg: string;
  badge: string;
  accent: string;
  todayBadge: string;
}> = {
  pink:   { headerBg: 'bg-purple-600', badge: 'bg-purple-100 text-purple-700', accent: 'text-purple-600', todayBadge: 'bg-purple-100 text-purple-600' },
  purple: { headerBg: 'bg-purple-900', badge: 'bg-purple-100 text-purple-900', accent: 'text-purple-900', todayBadge: 'bg-purple-100 text-purple-900' },
  blue:   { headerBg: 'bg-purple-800', badge: 'bg-purple-100 text-purple-800', accent: 'text-purple-800', todayBadge: 'bg-purple-100 text-purple-800' },
  green:  { headerBg: 'bg-purple-700', badge: 'bg-purple-100 text-purple-700', accent: 'text-purple-700', todayBadge: 'bg-purple-100 text-purple-700' },
  orange: { headerBg: 'bg-purple-500', badge: 'bg-purple-100 text-purple-600', accent: 'text-purple-500', todayBadge: 'bg-purple-100 text-purple-600' },
};

type Toast = { id: number; message: string; type: 'success' | 'error' };

export default function ScheduleEditor({
  groups,
  routes,
  days,
  initialSchedules,
  sessionType,
  sessionGroupId,
  todayDateStr,
  currentHour,
}: ScheduleEditorProps) {
  const [schedules, setSchedules] = useState<Record<string, WeekSchedule>>(initialSchedules);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedRosters, setExpandedRosters] = useState<Record<string, boolean>>({});

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const visibleGroups = sessionType === 'coach'
    ? groups
    : groups.filter(g => g.id === sessionGroupId);

  function isDayLocked(day: ScheduleDay): boolean {
    if (day.dateStr < todayDateStr) return true;
    if (day.dateStr === todayDateStr && currentHour >= 17) return true;
    return false;
  }

  function getRouteId(groupId: string, day: ScheduleDay): string {
    return schedules[day.weekOf]?.groups?.[groupId]?.[day.dayName]?.routeId || '';
  }

  async function handleRouteChange(groupId: string, day: ScheduleDay, routeId: string | null) {
    const key = `${groupId}:${day.dateStr}`;
    setSaving(key);
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, day: day.dayName, weekOf: day.weekOf, dateStr: day.dateStr, routeId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSchedules(prev => {
          const updated = { ...prev };
          if (!updated[day.weekOf]) updated[day.weekOf] = { weekOf: day.weekOf, groups: {} };
          if (!updated[day.weekOf].groups[groupId]) updated[day.weekOf].groups[groupId] = {};
          updated[day.weekOf].groups[groupId][day.dayName] = {
            routeId,
            updatedAt: new Date().toISOString(),
            updatedBy: sessionType === 'coach' ? 'Coach' : groupId,
          };
          return updated;
        });
        addToast('Route updated', 'success');
      } else {
        addToast(data.error || 'Failed to update', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {toast.type === 'success'
              ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            }
            {toast.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {days[0]?.label} – {days[days.length - 1]?.label}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {sessionType === 'coach' ? 'Managing all groups' : `${visibleGroups[0]?.name} schedule`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Locked after 5pm
        </div>
      </div>

      {/* Group cards */}
      <div className={`grid gap-6 ${visibleGroups.length === 1 ? 'grid-cols-1 max-w-2xl' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}`}>
        {visibleGroups.map(group => {
          const colors = COLOR_MAP[group.color] || COLOR_MAP.purple;

          return (
            <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Group header */}
              <div className={`${colors.headerBg} px-5 py-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg">{group.name}</h3>
                  <button
                    onClick={() => setExpandedRosters(prev => ({ ...prev, [group.id]: !prev[group.id] }))}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-full transition-colors font-medium"
                  >
                    <span>{group.runners.length} runners</span>
                    <svg className={`w-4 h-4 transition-transform ${expandedRosters[group.id] ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                {expandedRosters[group.id] && (
                  <div className="mt-3 pt-3 border-t border-white/20 flex flex-wrap gap-1.5">
                    {group.runners.map(runner => (
                      <span key={runner} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{runner}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Days */}
              <div className="divide-y divide-gray-100">
                {days.map(day => {
                  const locked = isDayLocked(day);
                  const currentRouteId = getRouteId(group.id, day);
                  const isSaving = saving === `${group.id}:${day.dateStr}`;
                  const selectedRoute = routes.find(r => r.id === currentRouteId);

                  return (
                    <div key={day.dateStr} className={`px-5 py-4 ${locked ? 'bg-gray-50' : ''}`}>
                      {/* Day label row */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-32 flex-shrink-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${day.isToday ? colors.accent : 'text-gray-700'}`}>
                              {day.label}
                            </span>
                            {day.isToday && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${colors.todayBadge}`}>
                                Today
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Route selector */}
                        <div className="flex-1">
                          {locked ? (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span className="text-sm text-gray-500">
                                {selectedRoute?.name || 'No route assigned'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <select
                                value={currentRouteId}
                                onChange={e => handleRouteChange(group.id, day, e.target.value || null)}
                                disabled={isSaving}
                                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 cursor-pointer"
                              >
                                <option value="">— No route (TBD) —</option>
                                {routes.map(route => (
                                  <option key={route.id} value={route.id}>{route.name}</option>
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

                      {/* Route image — full width below the row */}
                      {selectedRoute && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/routes/${selectedRoute.imageFile}`}
                          alt={selectedRoute.name}
                          className="w-full rounded-lg border border-gray-100"
                          style={{ maxHeight: '320px', objectFit: 'contain', objectPosition: 'center' }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
