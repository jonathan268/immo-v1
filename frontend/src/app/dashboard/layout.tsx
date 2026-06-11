'use client';

import { useAuth } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const navLinks = [
  { label: 'Mon Profil', href: '/dashboard', roles: null },
  { label: 'Mes Annonces', href: '/dashboard/properties', roles: ['OWNER'] },
  { label: 'Mes Demandes', href: '/dashboard/inquiries', roles: ['OWNER'] },
  { label: 'Mes Paiements', href: '/dashboard/payments', roles: ['OWNER'] },
  { label: 'Mes Feature Requests', href: '/dashboard/feature-requests', roles: null },
  { label: 'Admin', href: '/admin', roles: ['ADMIN'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const visibleLinks = navLinks.filter((l) => !l.roles || l.roles.includes(user.role));

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <aside className="hidden lg:flex flex-col w-64 bg-[var(--glass-bg)] backdrop-blur-2xl border-r border-[var(--glass-border)] p-4 shrink-0">
        <nav className="space-y-1">
          {visibleLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-700/90 text-white backdrop-blur-sm border border-[var(--glass-border)] shadow-lg shadow-primary-700/20'
                    : 'text-primary-700/70 hover:bg-[var(--glass-bg)] hover:text-primary-800'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:hidden bg-[var(--glass-bg)] backdrop-blur-2xl border-b border-[var(--glass-border)] p-3 overflow-x-auto">
        <nav className="flex gap-2 min-w-max">
          {visibleLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-700/90 text-white backdrop-blur-sm border border-[var(--glass-border)]'
                    : 'text-primary-700/70 hover:bg-[var(--glass-bg)]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 p-4 lg:p-8">
        {children}
      </div>
    </div>
  );
}
