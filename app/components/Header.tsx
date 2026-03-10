'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  isLoggedIn: boolean;
  isCoach: boolean;
}

export default function Header({ isLoggedIn, isCoach }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.refresh();
    router.push('/');
  }

  return (
    <header className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:bg-blue-400 transition-colors">
            LH
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">Lincoln High</div>
            <div className="text-blue-300 text-xs leading-tight">Running Team</div>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/" className="px-3 py-2 rounded-md text-sm text-blue-200 hover:text-white hover:bg-blue-800 transition-colors">
            Home
          </Link>
          {isLoggedIn && (
            <Link href="/schedule" className="px-3 py-2 rounded-md text-sm text-blue-200 hover:text-white hover:bg-blue-800 transition-colors">
              Schedule
            </Link>
          )}
          {isCoach && (
            <Link href="/attendance" className="px-3 py-2 rounded-md text-sm text-blue-200 hover:text-white hover:bg-blue-800 transition-colors">
              Attendance
            </Link>
          )}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className="ml-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm rounded-md font-medium transition-colors">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
