'use client';

import Link from 'next/link';
import { useState } from 'react';

const quickLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/properties', label: 'Annonces' },
  { href: '/auth/register', label: 'Inscription' },
  { href: '/auth/login', label: 'Connexion' },
];

const contactInfo = [
  { label: 'Douala, Cameroun', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'contact@immo.cm', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { label: '+237 6 90 00 00 00', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-[var(--glass-bg)] backdrop-blur-2xl border-t border-[var(--glass-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/">
              <img src="/logo.png" alt="Immo" className="w-16 h-16 rounded-xl" />
            </Link>
            <p className="mt-3 text-sm text-primary-500 leading-relaxed max-w-xs">
              La première plateforme immobilière au Cameroun. Trouvez votre prochain bien en toute simplicité.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-9 h-9 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-primary-500 hover:bg-[var(--glass-bg-hover)] hover:text-primary-600 transition-all" aria-label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-primary-500 hover:bg-[var(--glass-bg-hover)] hover:text-primary-600 transition-all" aria-label="Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-primary-500 hover:bg-[var(--glass-bg-hover)] hover:text-primary-600 transition-all" aria-label="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-heading font-semibold text-primary-700 uppercase tracking-wider mb-4">
              Liens rapides
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-heading font-semibold text-primary-700 uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              {contactInfo.map((item) => (
                <li key={item.label} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="text-sm text-primary-500">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-heading font-semibold text-primary-700 uppercase tracking-wider mb-4">
              Newsletter
            </h3>
            <p className="text-sm text-primary-500 mb-3">
              Recevez les dernières annonces directement par email.
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.fr"
                required
                className="flex-1 min-w-0 rounded-xl bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] px-3 py-2.5 text-sm text-primary-900 placeholder-primary-400 outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30 min-h-[44px]"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-primary-500 transition-colors min-h-[44px] cursor-pointer"
              >
                OK
              </button>
            </form>
            {subscribed && (
              <p className="mt-2 text-xs text-emerald-600 font-medium">Inscrit avec succès !</p>
            )}
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-primary-400">
            &copy; {new Date().getFullYear()} Immo. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-primary-400 hover:text-primary-500 transition-colors">
              Mentions légales
            </Link>
            <Link href="/" className="text-xs text-primary-400 hover:text-primary-500 transition-colors">
              Confidentialité
            </Link>
            <Link href="/" className="text-xs text-primary-400 hover:text-primary-500 transition-colors">
              CGU
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
