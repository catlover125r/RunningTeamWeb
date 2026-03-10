'use client';

import { useState } from 'react';
import { AttendanceRecord } from '@/lib/types';

interface Group {
  id: string;
  name: string;
  color: string;
  runners: string[];
}

interface Props {
  groups: Group[];
  initialRecords: AttendanceRecord[];
  today: string;
}

const COLOR_MAP: Record<string, { tab: string; activeTab: string; present: string }> = {
  blue: {
    tab: 'border-blue-200 text-blue-700',
    activeTab: 'bg-blue-600 text-white border-blue-600',
    present: 'bg-blue-100 text-blue-800',
  },
  green: {
    tab: 'border-green-200 text-green-700',
    activeTab: 'bg-green-600 text-white border-green-600',
    present: 'bg-green-100 text-green-800',
  },
  purple: {
    tab: 'border-purple-200 text-purple-700',
    activeTab: 'bg-purple-700 text-white border-purple-700',
    present: 'bg-purple-100 text-purple-800',
  },
  pink: {
    tab: 'border-pink-200 text-pink-600',
    activeTab: 'bg-pink-600 text-white border-pink-600',
    present: 'bg-pink-100 text-pink-800',
  },
  orange: {
    tab: 'border-orange-200 text-orange-700',
    activeTab: 'bg-orange-500 text-white border-orange-500',
    present: 'bg-orange-100 text-orange-800',
  },
};

export default function AttendanceManager({ groups, initialRecords, today }: Props) {
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '');
  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  function getRecord(date: string, groupId: string): AttendanceRecord | null {
    return records.find((r) => r.date === date && r.groupId === groupId) || null;
  }

  const currentRecord = getRecord(selectedDate, selectedGroupId);

  // Build runner list with present/absent state
  const runnerStates: { name: string; present: boolean }[] =
    selectedGroup?.runners.map((name) => ({
      name,
      present: currentRecord?.runners.find((r) => r.name === name)?.present ?? true,
    })) || [];

  function toggleRunner(name: string) {
    const existingRecord = getRecord(selectedDate, selectedGroupId);
    const runners = selectedGroup?.runners || [];

    const newRunners = runners.map((runnerName) => {
      const wasPresent =
        existingRecord?.runners.find((r) => r.name === runnerName)?.present ?? true;
      return {
        name: runnerName,
        present: runnerName === name ? !wasPresent : wasPresent,
      };
    });

    // Update local state
    const updatedRecord: AttendanceRecord = {
      date: selectedDate,
      groupId: selectedGroupId,
      runners: newRunners,
    };

    setRecords((prev) => {
      const idx = prev.findIndex(
        (r) => r.date === selectedDate && r.groupId === selectedGroupId
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = updatedRecord;
        return updated;
      }
      return [...prev, updatedRecord];
    });
  }

  async function handleSave() {
    const record = getRecord(selectedDate, selectedGroupId);
    if (!record && !selectedGroup) return;

    setSaving(true);
    setSaveSuccess(false);

    const runners = selectedGroup?.runners.map((name) => {
      const current = record?.runners.find((r) => r.name === name);
      return { name, present: current?.present ?? true };
    }) || [];

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          groupId: selectedGroupId,
          runners,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  // Recent attendance summary (last 5 records sorted by date desc)
  const recentRecords = [...records]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  const presentCount = runnerStates.filter((r) => r.present).length;
  const totalCount = runnerStates.length;

  return (
    <div className="space-y-8">
      {/* Date + Group selection */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Group</label>
            <div className="flex gap-2">
              {groups.map((group) => {
                const colors = COLOR_MAP[group.color] || COLOR_MAP.purple;
                const isActive = group.id === selectedGroupId;
                return (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`flex-1 py-2.5 px-3 text-sm font-medium rounded-lg border-2 transition-all ${
                      isActive ? colors.activeTab : `bg-white ${colors.tab} hover:opacity-80`
                    }`}
                  >
                    {group.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Attendance summary */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">{selectedGroup?.name} &mdash; {formatDate(selectedDate)}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {presentCount} / {totalCount} present
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">
                {totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%
              </div>
              <div className="text-xs text-gray-500">attendance rate</div>
            </div>
          </div>
        </div>

        {/* Runner list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
          {runnerStates.map(({ name, present }) => {
            const colors = COLOR_MAP[selectedGroup?.color || 'purple'] || COLOR_MAP.purple;
            return (
              <button
                key={name}
                onClick={() => toggleRunner(name)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-left ${
                  present
                    ? `border-green-200 bg-green-50 hover:bg-green-100`
                    : `border-red-200 bg-red-50 hover:bg-red-100`
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  present ? 'bg-green-500 border-green-500' : 'bg-white border-red-300'
                }`}>
                  {present && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {!present && (
                    <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm font-medium ${present ? 'text-green-800' : 'text-red-700'}`}>
                  {name}
                </span>
                <span className={`ml-auto text-xs font-medium ${present ? colors.present : 'bg-red-100 text-red-700'} px-2 py-0.5 rounded-full`}>
                  {present ? 'Present' : 'Absent'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
              {presentCount} present
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-400 rounded-full inline-block"></span>
              {totalCount - presentCount} absent
            </span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2.5 font-medium rounded-lg transition-all text-sm ${
              saveSuccess
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50`}
          >
            {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Recent records table */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Attendance</h2>
        {recentRecords.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No attendance records yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Group</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Present</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentRecords.map((record, idx) => {
                  const group = groups.find((g) => g.id === record.groupId);
                  const present = record.runners.filter((r) => r.present).length;
                  const total = record.runners.length;
                  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

                  return (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-700">
                        {new Date(record.date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          COLOR_MAP[group?.color || 'blue']?.present || 'bg-blue-100 text-blue-800'
                        }`}>
                          {group?.name || record.groupId}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{present} / {total}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="text-gray-600 text-xs">{rate}%</span>
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
