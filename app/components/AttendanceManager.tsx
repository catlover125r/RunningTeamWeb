'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { AttendanceRecord, AttendanceStatus, AttendanceRosterSection } from '@/lib/types';

interface Props {
  roster: AttendanceRosterSection[];
  initialRecords: AttendanceRecord[];
  today: string;
}

function StatusToggle({
  status,
  onChange,
}: {
  status: AttendanceStatus;
  onChange: (s: AttendanceStatus) => void;
}) {
  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
      <button
        onClick={() => onChange(status === 'absent' ? 'unknown' : 'absent')}
        className={`px-3 py-2 transition-colors ${
          status === 'absent'
            ? 'bg-red-500 text-white'
            : 'bg-white text-gray-400 hover:bg-red-50 hover:text-red-500'
        }`}
      >
        Absent
      </button>
      <button
        onClick={() => onChange('unknown')}
        className={`px-3 py-2 border-x border-gray-200 transition-colors ${
          status === 'unknown'
            ? 'bg-gray-200 text-gray-600'
            : 'bg-white text-gray-300 hover:bg-gray-100'
        }`}
      >
        —
      </button>
      <button
        onClick={() => onChange(status === 'present' ? 'unknown' : 'present')}
        className={`px-3 py-2 transition-colors ${
          status === 'present'
            ? 'bg-green-500 text-white'
            : 'bg-white text-gray-400 hover:bg-green-50 hover:text-green-600'
        }`}
      >
        Here
      </button>
    </div>
  );
}

export default function AttendanceManager({ roster, initialRecords, today }: Props) {
  const [selectedDate, setSelectedDate] = useState(today);
  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const allRunners = roster.flatMap(s => s.runners);

  const absenceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allRunners.forEach(n => { counts[n] = 0; });
    records.forEach(r => {
      r.runners.forEach(runner => {
        if (runner.status === 'absent') {
          counts[runner.name] = (counts[runner.name] || 0) + 1;
        }
      });
    });
    return counts;
  }, [records, allRunners]);

  function getRecord(date: string): AttendanceRecord | null {
    return records.find(r => r.date === date) || null;
  }

  function getStatus(name: string): AttendanceStatus {
    return getRecord(selectedDate)?.runners.find(r => r.name === name)?.status ?? 'unknown';
  }

  function setStatus(name: string, status: AttendanceStatus) {
    setRecords(prev => {
      const existing = prev.find(r => r.date === selectedDate);
      const baseRunners = existing?.runners ?? allRunners.map(n => ({ name: n, status: 'unknown' as AttendanceStatus }));
      const newRunners = baseRunners.map(r => r.name === name ? { ...r, status } : r);
      // ensure all runners are included
      const runnerNames = new Set(newRunners.map(r => r.name));
      allRunners.forEach(n => { if (!runnerNames.has(n)) newRunners.push({ name: n, status: 'unknown' }); });
      const updated: AttendanceRecord = { date: selectedDate, runners: newRunners };
      if (existing) return prev.map(r => r.date === selectedDate ? updated : r);
      return [...prev, updated];
    });
  }

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setSaving(true);
      setSaveSuccess(false);
      const existing = getRecord(selectedDate);
      const runners = allRunners.map(name => ({
        name,
        status: existing?.runners.find(r => r.name === name)?.status ?? 'unknown',
      }));
      try {
        const res = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: selectedDate, runners }),
        });
        if (res.ok) { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 2000); }
      } catch { /* silent */ }
      finally { setSaving(false); }
    }, 800);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, selectedDate]);

  const presentCount = allRunners.filter(n => getStatus(n) === 'present').length;
  const absentCount = allRunners.filter(n => getStatus(n) === 'absent').length;
  const unknownCount = allRunners.filter(n => getStatus(n) === 'unknown').length;

  return (
    <div className="space-y-6">
      {/* Absence Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowReport(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Absence Report</h2>
              <button onClick={() => setShowReport(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6">
              {roster.map(section => {
                const sorted = [...section.runners].sort((a, b) => (absenceCounts[b] || 0) - (absenceCounts[a] || 0));
                return (
                  <div key={section.label}>
                    <h3 className="text-sm font-bold text-purple-700 uppercase tracking-wider mb-2">{section.label}</h3>
                    <div className="space-y-1">
                      {sorted.map(name => {
                        const count = absenceCounts[name] || 0;
                        return (
                          <div key={name} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                            <span className="text-sm text-gray-700">{name}</span>
                            <span className={`text-sm font-semibold min-w-[2rem] text-right ${count === 0 ? 'text-gray-400' : count >= 3 ? 'text-red-600' : 'text-orange-500'}`}>
                              {count === 0 ? '—' : count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {saving && <span>Saving…</span>}
          {!saving && saveSuccess && <span className="text-green-600">Saved</span>}
        </div>
        <button
          onClick={() => setShowReport(true)}
          className="px-4 py-2 text-sm font-medium text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
        >
          Absence Report
        </button>
      </div>

      {/* Date picker + summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-4 sm:ml-auto text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
              <span className="text-gray-600">{presentCount} here</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
              <span className="text-gray-600">{absentCount} absent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />
              <span className="text-gray-600">{unknownCount} unmarked</span>
            </div>
          </div>
        </div>

        {/* Roster by section */}
        <div className="space-y-6">
          {roster.map(section => (
            <div key={section.label}>
              <h3 className="text-sm font-bold text-purple-700 uppercase tracking-wider mb-3">
                {section.label}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {section.runners.map(name => {
                  const status = getStatus(name);
                  return (
                    <div
                      key={name}
                      className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border transition-colors ${
                        status === 'present' ? 'bg-green-50 border-green-200' :
                        status === 'absent'  ? 'bg-red-50 border-red-200' :
                        'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <span className={`text-sm font-medium min-w-0 truncate ${
                        status === 'present' ? 'text-green-800' :
                        status === 'absent'  ? 'text-red-700' :
                        'text-gray-600'
                      }`}>
                        {name}
                      </span>
                      <div className="shrink-0">
                        <StatusToggle status={status} onChange={s => setStatus(name, s)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Recent records */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Attendance</h2>
        {records.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No attendance records yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Here</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Absent</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10).map((record, idx) => {
                  const present = record.runners.filter(r => r.status === 'present').length;
                  const absent = record.runners.filter(r => r.status === 'absent').length;
                  const marked = present + absent;
                  const rate = marked > 0 ? Math.round((present / marked) * 100) : 0;
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-700">
                        {new Date(record.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 text-green-700 font-medium">{present}</td>
                      <td className="px-5 py-3 text-red-600 font-medium">{absent}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-gray-500 text-xs">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
