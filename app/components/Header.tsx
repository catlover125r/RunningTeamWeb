'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface HeaderProps {
  isLoggedIn: boolean;
  isCoach: boolean;
}

export default function Header({ isLoggedIn, isCoach }: HeaderProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    setSidebarOpen(false);
    router.refresh();
    router.push('/');
  }

  const navLinks = (
    <>
      <Link href="/" onClick={() => setSidebarOpen(false)} className="px-3 py-2 rounded-md text-sm text-purple-200 hover:text-white hover:bg-purple-700 transition-colors">
        Home
      </Link>
      {isLoggedIn && (
        <Link href="/schedule" onClick={() => setSidebarOpen(false)} className="px-3 py-2 rounded-md text-sm text-purple-200 hover:text-white hover:bg-purple-700 transition-colors">
          Schedule
        </Link>
      )}
      {isCoach && (
        <Link href="/attendance" onClick={() => setSidebarOpen(false)} className="px-3 py-2 rounded-md text-sm text-purple-200 hover:text-white hover:bg-purple-700 transition-colors">
          Attendance
        </Link>
      )}
      {isCoach && (
        <Link href="/announcements" onClick={() => setSidebarOpen(false)} className="px-3 py-2 rounded-md text-sm text-purple-200 hover:text-white hover:bg-purple-700 transition-colors">
          Announcements
        </Link>
      )}
      {isLoggedIn ? (
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-sm rounded-md transition-colors"
        >
          Logout
        </button>
      ) : (
        <Link href="/login" onClick={() => setSidebarOpen(false)} className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white text-sm rounded-md font-medium transition-colors">
          Login
        </Link>
      )}
    </>
  );

  return (
    <>
      <header className="bg-purple-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:bg-purple-400 transition-colors">
              SQ
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">Sequoia XC</div>
              <div className="text-purple-300 text-xs leading-tight">Sequoia High School</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-purple-200 hover:text-white hover:bg-purple-700 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-purple-800 text-white z-50 shadow-2xl transform transition-transform duration-300 md:hidden ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-purple-700">
          <span className="font-bold text-lg">Menu</span>
          <button
            className="p-2 rounded-md text-purple-200 hover:text-white hover:bg-purple-700 transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-4">
          {navLinks}
        </nav>
      </div>
    </>
  );
}
