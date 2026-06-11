'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function IconHeart({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function IconGrid({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function IconLogin({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  );
}

function IconLogout({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function NavLink({ href, icon, label, onClick }: { href: string; icon: ReactNode; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2 font-medium transition-colors ${
        isActive
          ? 'text-sm text-primary-500'
          : 'text-sm text-primary-600 hover:text-primary-500'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <>
      <nav className="sticky top-0 z-40 hidden md:block" style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--glass-border)', boxShadow: '0 4px 6px -1px var(--glass-shadow)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <img src="/logo.png" alt="Immo" className="w-12 h-12 rounded-xl" />
            </Link>

            <div className="flex items-center gap-5">
              <NavLink href="/" icon={<IconHome className="w-4 h-4 shrink-0" />} label="Accueil" />
              <NavLink href="/properties" icon={<IconSearch className="w-4 h-4 shrink-0" />} label="Annonces" />

              {user && (
                <NavLink href="/favorites" icon={<IconHeart className="w-4 h-4 shrink-0" />} label="Favoris" />
              )}

              {user ? (
                <>
                  <NavLink href="/dashboard" icon={<IconGrid className="w-4 h-4 shrink-0" />} label="Dashboard" />
                  <span className="text-sm text-primary-500">{user.full_name}</span>
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 text-sm font-medium text-red-600/80 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <IconLogout className="w-4 h-4 shrink-0" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    <IconLogin className="w-4 h-4 shrink-0" />
                    Connexion
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm">Inscription</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50" style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(24px)', borderTop: '1px solid var(--glass-border)', boxShadow: '0 -4px 6px -1px var(--glass-shadow)' }}>
        <div className="flex items-center justify-around h-16 px-2">
          <BottomNavItem href="/" icon={<IconHome className="w-5 h-5" />} label="Accueil" isActive={isActive('/')} />
          <BottomNavItem href="/properties" icon={<IconSearch className="w-5 h-5" />} label="Annonces" isActive={isActive('/properties')} />

          {user ? (
            <>
              <BottomNavItem href="/favorites" icon={<IconHeart className="w-5 h-5" />} label="Favoris" isActive={isActive('/favorites')} />
              <BottomNavItem href="/dashboard" icon={<IconGrid className="w-5 h-5" />} label="Dashboard" isActive={isActive('/dashboard')} />
            </>
          ) : (
            <>
              <BottomNavItem href="/auth/login" icon={<IconLogin className="w-5 h-5" />} label="Connexion" isActive={isActive('/auth/login')} />
              <BottomNavItem href="/auth/register" icon={<IconHeart className="w-5 h-5" />} label="Inscription" isActive={isActive('/auth/register')} />
            </>
          )}
        </div>
      </nav>
    </>
  );
}

function BottomNavItem({ href, icon, label, isActive: active }: { href: string; icon: ReactNode; label: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 min-w-0 px-2 py-1 rounded-xl transition-colors ${
        active
          ? 'text-primary-500'
          : 'text-primary-600/60 hover:text-primary-500'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium leading-tight truncate max-w-full">{label}</span>
    </Link>
  );
}
