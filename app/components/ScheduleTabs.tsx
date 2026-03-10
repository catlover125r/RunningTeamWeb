'use client';

import { useState } from 'react';

interface Props {
  scheduleEditor: React.ReactNode;
  announcementsManager: React.ReactNode;
}

export default function ScheduleTabs({ scheduleEditor, announcementsManager }: Props) {
  const [tab, setTab] = useState<'schedule' | 'announcements'>('schedule');

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('schedule')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === 'schedule'
              ? 'bg-white text-purple-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Schedule
        </button>
        <button
          onClick={() => setTab('announcements')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === 'announcements'
              ? 'bg-white text-purple-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Announcements
        </button>
      </div>

      {tab === 'schedule' ? scheduleEditor : announcementsManager}
    </div>
  );
}
