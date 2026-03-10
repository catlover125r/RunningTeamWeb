import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import Header from './components/Header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Lincoln High Running Team',
  description: 'Route and schedule management for Lincoln High Running Team',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const session = getSession(null, cookieStore);
  const isLoggedIn = session !== null;
  const isCoach = session?.type === 'coach';

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}>
        <Header isLoggedIn={isLoggedIn} isCoach={isCoach} />
        <main>{children}</main>
        <footer className="mt-16 bg-blue-900 text-blue-300 text-center py-6 text-sm">
          <div className="max-w-6xl mx-auto px-4">
            <p className="font-medium text-white mb-1">Lincoln High Running Team</p>
            <p>Route management system &mdash; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
