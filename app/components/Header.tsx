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

        <nav className="flex items-center gap-2">
          <Link href="/" className="px-3 py-2 rounded-md text-sm text-purple-200 hover:text-white hover:bg-purple-700 transition-colors">
            Home
          </Link>
          {isLoggedIn && (
            <Link href="/schedule" className="px-3 py-2 rounded-md text-sm text-purple-200 hover:text-white hover:bg-purple-700 transition-colors">
              Schedule
            </Link>
          )}
          {isCoach && (
            <Link href="/attendance" className="px-3 py-2 rounded-md text-sm text-purple-200 hover:text-white hover:bg-purple-700 transition-colors">
              Attendance
            </Link>
          )}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-sm rounded-md transition-colors"
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className="ml-2 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white text-sm rounded-md font-medium transition-colors">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
