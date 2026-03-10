'use client';

import { useState } from 'react';

interface Colors {
  bg: string;
  border: string;
  badge: string;
  text: string;
}

interface Props {
  name: string;
  runners: string[];
  colors: Colors;
  routeName?: string;
  imageFile?: string;
}

export default function HomeGroupCard({ name, runners, colors, routeName, imageFile }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} overflow-hidden shadow-sm`}>
      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
            {name}
          </span>
          <p className="text-xs text-gray-500 mt-1">Today&apos;s Route</p>
        </div>
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span>{runners.length} runners</span>
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="px-5 pb-4 flex flex-wrap gap-1.5 border-t border-gray-100 pt-3">
          {runners.map(runner => (
            <span key={runner} className={`text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600`}>
              {runner}
            </span>
          ))}
        </div>
      )}

      <div className="bg-white border-t border-gray-100">
        {routeName && imageFile ? (
          <>
            <div className="px-5 pt-4 pb-2">
              <h3 className="font-bold text-xl text-gray-900">{routeName}</h3>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/routes/${imageFile}`}
              alt={routeName}
              className="w-full object-contain max-h-96"
            />
          </>
        ) : (
          <p className="px-5 py-5 text-gray-400 italic">No route assigned yet</p>
        )}
      </div>
    </div>
  );
}
