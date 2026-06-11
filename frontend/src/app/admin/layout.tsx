'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Utilisateurs' },
  { href: '/admin/properties', label: 'Annonces' },
  { href: '/admin/payments', label: 'Paiements' },
  { href: '/admin/inquiries', label: 'Demandes' },
  { href: '/admin/feature-requests', label: 'Feature Requests' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--body-bg)' }}>
      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--glass-bg)] backdrop-blur-2xl border-r border-[var(--glass-border)] transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b border-[var(--glass-border)]">
            <Link href="/admin" className="text-xl font-heading font-bold text-primary-700 tracking-wide">
              Admin Immo
            </Link>
            <button onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl text-primary-500 hover:bg-[var(--glass-bg)] transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
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
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--glass-border)]">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-primary-700/70 hover:bg-[var(--glass-bg)] hover:text-primary-800 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour au Dashboard
            </Link>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-primary-900/20 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="flex-1 min-w-0">
          <div className="sticky top-0 z-20 bg-[var(--glass-bg)] backdrop-blur-2xl border-b border-[var(--glass-border)] lg:hidden">
            <div className="flex items-center h-16 px-4">
              <button onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl text-primary-500 hover:bg-[var(--glass-bg)] transition-colors cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="ml-3 text-lg font-heading font-semibold text-primary-800">Admin</span>
            </div>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
