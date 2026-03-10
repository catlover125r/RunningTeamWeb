'use client';

import { useState } from 'react';
import { Announcement } from '@/lib/types';

interface Props {
  initialAnnouncements: Announcement[];
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AnnouncementsManager({ initialAnnouncements }: Props) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [newContent, setNewContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim()) return;
    setPosting(true);
    setError('');

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent.trim() }),
      });

      if (res.ok) {
        const announcement = await res.json();
        setAnnouncements((prev) => [announcement, ...prev]);
        setNewContent('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to post announcement');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      // silent
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* New announcement form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Post Announcement</h2>
        <form onSubmit={handlePost} className="space-y-3">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Write an announcement for the team..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={posting || !newContent.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors text-sm"
            >
              {posting ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing announcements */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          Current Announcements
          {announcements.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">({announcements.length})</span>
          )}
        </h2>

        {announcements.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No announcements yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 flex items-start gap-4"
              >
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{announcement.content}</p>
                  <p className="text-xs text-gray-500 mt-1.5">
                    {announcement.author} &mdash; {formatDate(announcement.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  disabled={deleting === announcement.id}
                  className="flex-shrink-0 text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                  title="Delete announcement"
                >
                  {deleting === announcement.id ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
