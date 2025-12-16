'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useThemeStore } from '@/store';
import { useSession, signOut } from 'next-auth/react';

interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Tasks', href: '/tasks' },
  { name: 'Users', href: '/users' },
  { name: 'Settings', href: '/settings' },
];

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useThemeStore();
  const { data: session, status } = useSession();

  const handleAuthAction = async () => {
    if (session) {
      await signOut({ redirect: false });
      router.push('/');
    } else {
      router.push('/auth/signin');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                Next.js App
              </Link>
            </div>
            {status === 'authenticated' && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-blue-500 text-gray-900 dark:text-white'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                      }`}
                    >
                      {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            
            {session?.user && (
              <div className="hidden sm:flex items-center space-x-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {session.user.name || session.user.email}
                </span>
              </div>
            )}
            
            <button 
              onClick={handleAuthAction}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {session ? 'Sign Out' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {status === 'authenticated' && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};